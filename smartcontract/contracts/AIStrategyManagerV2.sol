//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IYieldMindVault {
    function updatePositionValue(address user, uint256 newValue) external;
}

interface IExternalProtocol {
    function deposit(address token, uint256 amount) external returns (uint256);

    function withdraw(address token, uint256 amount) external returns (uint256);

    function getBalance(
        address user,
        address token
    ) external view returns (uint256);
}

interface IUniswapV3StrategyAdapter {
    function depositUSDC(uint256 usdcAmount, address user) external;

    function withdrawUserPosition(address user, uint256 percentage) external;

    function getUserBalance(address user) external view returns (uint256);

    function getEstimatedAPY() external view returns (uint256);

    function collectFees(address user) external;
}

contract AIStrategyManagerV2 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Events
    event StrategyExecuted(
        address indexed user,
        address indexed token,
        uint256 amount,
        string protocolName
    );
    event ProtocolAdded(
        address indexed protocol,
        string name,
        string protocolType
    );
    event PortfolioRebalanced(address indexed user, uint256 newValue);

    // Structs
    struct Protocol {
        address protocolAddress;
        string name;
        string protocolType; // "uniswap", "compound", "mock", etc.
        uint256 currentAPY; // APY in basis points (100 = 1%)
        uint256 riskScore; // Risk score 1-100 (1=safest)
        uint256 tvl; // Total Value Locked
        bool isActive;
        uint256 lastUpdate; // Last data update timestamp
    }

    struct UserStrategy {
        mapping(address => uint256) protocolAllocations; // protocol => amount
        uint256 totalValue;
        uint256 lastRebalance;
        address depositToken;
        address selectedProtocol; // Currently selected protocol
    }

    // State variables - FIXED: Removed immutable
    IYieldMindVault public yieldMindVault;
    IUniswapV3StrategyAdapter public uniswapAdapter;

    mapping(address => Protocol) public protocols;
    address[] public protocolList;
    mapping(address => UserStrategy) public userStrategies;

    // Network configuration
    address public USDC;
    uint256 public constant DATA_VALIDITY_PERIOD = 1 hours;

    modifier onlyVault() {
        require(msg.sender == address(yieldMindVault), "Only vault can call");
        _;
    }

    constructor(address _yieldMindVault) Ownable(msg.sender) {
        yieldMindVault = IYieldMindVault(_yieldMindVault);
        _initializeNetwork();
    }

    /**
     * @dev Initialize network-specific addresses
     */
    function _initializeNetwork() internal {
        uint256 chainId = block.chainid;

        if (chainId == 8453) {
            // Base Mainnet
            USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
        } else if (chainId == 84532) {
            // Base Sepolia Testnet
            USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
        } else if (chainId == 31337 || chainId == 1337) {
            // Local Hardhat - you'll need to deploy mock USDC
            USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
        } else {
            revert("Unsupported network");
        }
    }

    // ADDED: Function to update vault address
    /**
     * @dev Set vault address (for testing/migration)
     */
    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid vault address");
        yieldMindVault = IYieldMindVault(_vault);
    }

    // ADDED: Function with correct name for tests
    /**
     * @dev Set USDC address for local testing
     */
    function setUSDC(address _usdc) external onlyOwner {
        USDC = _usdc;
    }

    /**
     * @dev Execute AI-recommended strategy for user deposit
     */
    function executeStrategy(
        uint256 amount,
        address token
    ) external onlyVault nonReentrant {
        require(token == USDC || token == address(0), "Only USDC supported");
        address user = tx.origin; // Get original caller (user)

        // Get optimal protocol from AI engine
        address selectedProtocol = _getOptimalProtocol(amount, token);
        string memory protocolName = protocols[selectedProtocol].name;

        UserStrategy storage strategy = userStrategies[user];
        strategy.depositToken = token;
        strategy.selectedProtocol = selectedProtocol;

        // Deploy funds to selected protocol
        if (selectedProtocol != address(0)) {
            _deployToProtocol(selectedProtocol, token, amount, user);
            strategy.protocolAllocations[selectedProtocol] += amount;
        }

        strategy.totalValue += amount;
        strategy.lastRebalance = block.timestamp;

        emit StrategyExecuted(user, token, amount, protocolName);
    }

    /**
     * @dev Get optimal protocol based on AI analysis
     */
    function _getOptimalProtocol(
        uint256 amount,
        address token
    ) internal view returns (address) {
        address bestProtocol = address(0);
        uint256 bestScore = 0;

        for (uint256 i = 0; i < protocolList.length; i++) {
            address protocolAddr = protocolList[i];
            Protocol memory protocol = protocols[protocolAddr];

            if (
                !protocol.isActive ||
                block.timestamp > protocol.lastUpdate + DATA_VALIDITY_PERIOD
            ) {
                continue;
            }

            // Risk-adjusted score: APY / sqrt(riskScore)
            uint256 score = (protocol.currentAPY * 100) /
                _sqrt(protocol.riskScore);

            // Bonus for Uniswap (more proven, available on testnet)
            if (
                keccak256(bytes(protocol.protocolType)) ==
                keccak256(bytes("uniswap"))
            ) {
                score = (score * 110) / 100; // 10% bonus
            }

            if (score > bestScore) {
                bestScore = score;
                bestProtocol = protocolAddr;
            }
        }

        return bestProtocol;
    }

    /**
     * @dev Deploy funds to specific protocol
     */
    function _deployToProtocol(
        address protocol,
        address token,
        uint256 amount,
        address user
    ) internal {
        require(protocols[protocol].isActive, "Protocol not active");

        string memory protocolType = protocols[protocol].protocolType;

        if (keccak256(bytes(protocolType)) == keccak256(bytes("uniswap"))) {
            // Deploy to Uniswap V3 through adapter
            require(
                address(uniswapAdapter) != address(0),
                "Uniswap adapter not set"
            );
            IERC20(token).safeTransfer(address(uniswapAdapter), amount);
            uniswapAdapter.depositUSDC(amount, user);
        } else if (keccak256(bytes(protocolType)) == keccak256(bytes("mock"))) {
            // Deploy to mock protocol for testing
            IERC20(token).approve(protocol, amount);
            IExternalProtocol(protocol).deposit(token, amount);
        } else {
            // Deploy to other external protocols
            IERC20(token).approve(protocol, amount);
            IExternalProtocol(protocol).deposit(token, amount);
        }
    }

    /**
     * @dev Rebalance user's portfolio
     */
    function rebalancePortfolio(address user) external onlyVault nonReentrant {
        UserStrategy storage strategy = userStrategies[user];
        require(strategy.totalValue > 0, "No position to rebalance");

        // Calculate current portfolio value
        uint256 currentValue = _calculatePortfolioValue(user);

        // Update portfolio value in vault
        yieldMindVault.updatePositionValue(user, currentValue);

        strategy.totalValue = currentValue;
        strategy.lastRebalance = block.timestamp;

        emit PortfolioRebalanced(user, currentValue);
    }

    /**
     * @dev Calculate current portfolio value for user
     */
    function _calculatePortfolioValue(
        address user
    ) internal view returns (uint256) {
        UserStrategy storage strategy = userStrategies[user];

        if (strategy.selectedProtocol == address(0)) {
            return strategy.totalValue;
        }

        Protocol memory protocol = protocols[strategy.selectedProtocol];

        if (
            keccak256(bytes(protocol.protocolType)) ==
            keccak256(bytes("uniswap"))
        ) {
            // Get value from Uniswap adapter
            return uniswapAdapter.getUserBalance(user);
        } else {
            // Get value from other protocols
            return
                IExternalProtocol(strategy.selectedProtocol).getBalance(
                    address(this),
                    strategy.depositToken
                );
        }
    }

    /**
     * @dev Initialize Uniswap protocol
     */
    function initializeUniswap(address _uniswapAdapter) external onlyOwner {
        uniswapAdapter = IUniswapV3StrategyAdapter(_uniswapAdapter);

        addProtocol(
            _uniswapAdapter,
            "Uniswap V3 USDC/WETH",
            "uniswap",
            1500, // 15% APY
            20, // Risk score (20 = low risk)
            1000000000 * 1e6, // TVL (~1B USDC)
            true // Is active
        );
    }

    /**
     * @dev Add mock protocol for testing
     */
    function addMockProtocol(
        address protocolAddress,
        string memory name,
        uint256 apy,
        uint256 riskScore
    ) external onlyOwner {
        addProtocol(
            protocolAddress,
            name,
            "mock",
            apy,
            riskScore,
            100000 * 1e6,
            true
        );
    }

    /**
     * @dev Add new protocol to strategy options
     */
    function addProtocol(
        address protocolAddress,
        string memory name,
        string memory protocolType,
        uint256 initialAPY,
        uint256 riskScore,
        uint256 tvl,
        bool isActive
    ) public onlyOwner {
        require(protocolAddress != address(0), "Invalid protocol address");
        require(riskScore <= 100, "Risk score must be <= 100");
        require(bytes(protocolType).length > 0, "Protocol type required");

        protocols[protocolAddress] = Protocol({
            protocolAddress: protocolAddress,
            name: name,
            protocolType: protocolType,
            currentAPY: initialAPY,
            riskScore: riskScore,
            tvl: tvl,
            isActive: isActive,
            lastUpdate: block.timestamp
        });

        protocolList.push(protocolAddress);

        emit ProtocolAdded(protocolAddress, name, protocolType);
    }

    /**
     * @dev Update protocol data
     */
    function updateProtocolData(
        address protocol,
        uint256 newAPY,
        uint256 newRiskScore,
        uint256 newTVL
    ) external onlyOwner {
        require(
            protocols[protocol].protocolAddress != address(0),
            "Protocol not found"
        );

        Protocol storage p = protocols[protocol];
        p.currentAPY = newAPY;
        p.riskScore = newRiskScore;
        p.tvl = newTVL;
        p.lastUpdate = block.timestamp;
    }

    /**
     * @dev Withdraw user funds from protocol
     */
    function withdrawFromProtocol(
        address user,
        uint256 percentage
    ) external onlyVault nonReentrant {
        require(percentage > 0 && percentage <= 100, "Invalid percentage");

        UserStrategy storage strategy = userStrategies[user];
        require(
            strategy.selectedProtocol != address(0),
            "No protocol selected"
        );

        Protocol memory protocol = protocols[strategy.selectedProtocol];

        if (
            keccak256(bytes(protocol.protocolType)) ==
            keccak256(bytes("uniswap"))
        ) {
            // Withdraw from Uniswap adapter
            uniswapAdapter.withdrawUserPosition(user, percentage);
        } else {
            // Withdraw from other protocols
            uint256 withdrawAmount = (strategy.protocolAllocations[
                strategy.selectedProtocol
            ] * percentage) / 100;
            IExternalProtocol(strategy.selectedProtocol).withdraw(
                strategy.depositToken,
                withdrawAmount
            );
        }

        if (percentage == 100) {
            // Full withdrawal - reset user strategy
            strategy.totalValue = 0;
            strategy.protocolAllocations[strategy.selectedProtocol] = 0;
            strategy.selectedProtocol = address(0);
        } else {
            // Partial withdrawal - update allocations
            uint256 remainingAllocation = (strategy.protocolAllocations[
                strategy.selectedProtocol
            ] * (100 - percentage)) / 100;
            strategy.protocolAllocations[
                strategy.selectedProtocol
            ] = remainingAllocation;
            strategy.totalValue =
                (strategy.totalValue * (100 - percentage)) /
                100;
        }
    }

    /**
     * @dev Collect fees from Uniswap position
     */
    function collectFeesForUser(address user) external {
        UserStrategy storage strategy = userStrategies[user];

        if (strategy.selectedProtocol != address(0)) {
            Protocol memory protocol = protocols[strategy.selectedProtocol];

            if (
                keccak256(bytes(protocol.protocolType)) ==
                keccak256(bytes("uniswap"))
            ) {
                uniswapAdapter.collectFees(user);
            }
        }
    }

    /**
     * @dev Get user's current strategy info
     */
    function getUserStrategy(
        address user
    )
        external
        view
        returns (
            uint256 totalValue,
            uint256 lastRebalance,
            address depositToken,
            address selectedProtocol,
            string memory protocolName
        )
    {
        UserStrategy storage strategy = userStrategies[user];
        string memory name = strategy.selectedProtocol != address(0)
            ? protocols[strategy.selectedProtocol].name
            : "";

        return (
            strategy.totalValue,
            strategy.lastRebalance,
            strategy.depositToken,
            strategy.selectedProtocol,
            name
        );
    }

    /**
     * @dev Get protocol information
     */
    function getProtocolInfo(
        address protocol
    )
        external
        view
        returns (
            address protocolAddress,
            string memory name,
            string memory protocolType,
            uint256 currentAPY,
            uint256 riskScore,
            uint256 tvl,
            bool isActive,
            uint256 lastUpdate
        )
    {
        Protocol memory p = protocols[protocol];
        return (
            p.protocolAddress,
            p.name,
            p.protocolType,
            p.currentAPY,
            p.riskScore,
            p.tvl,
            p.isActive,
            p.lastUpdate
        );
    }

    /**
     * @dev Get all registered protocols
     */
    function getAllProtocols() external view returns (address[] memory) {
        return protocolList;
    }

    /**
     * @dev Emergency withdraw function
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    /**
     * @dev Square root function for risk calculations
     */
    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}
