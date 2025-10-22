//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ============================================================================
// EXTERNAL INTERFACES - USER APY ONLY
// ============================================================================

interface IYieldMindVault {
    function updatePositionValue(address user, uint256 newValue) external;
}

interface IExternalProtocol {
    function deposit(address token, uint256 amount) external returns (uint256);
    function withdraw(address token, uint256 amount) external returns (uint256);
    function getBalance(address user, address token) external view returns (uint256);
}

interface IUniswapV3StrategyAdapter {
    function depositUSDC(uint256 usdcAmount, address user) external;
    function withdrawUserPosition(address user, uint256 percentage) external;
    function getUserBalance(address user) external view returns (uint256);
    function collectFees(address user) external;
    function getUserAPY(address user) external view returns (
        uint256 userAPY,
        uint256 totalFeesEarned,
        uint256 daysActive,
        uint256 dailyReturn
    );
    function getUserPerformance(address user) external view returns (
        uint256 depositAmount,
        uint256 currentValue,
        uint256 totalFeesEarned,
        uint256 userAPY,
        uint256 daysActive,
        int256 profitLoss
    );
}

// ============================================================================
// AI STRATEGY MANAGER V2 - USER APY TRACKING ONLY
// ============================================================================

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
        uint256 currentAPY; // APY in basis points (100 = 1%) - stored for reference
        uint256 riskScore; // Risk score 1-100 (1=safest)
        uint256 tvl; // Total Value Locked
        bool isActive;
        uint256 lastUpdate;
    }

    struct UserStrategy {
        mapping(address => uint256) protocolAllocations; // protocol => amount
        uint256 totalValue;
        uint256 lastRebalance;
        address depositToken;
        address selectedProtocol;
    }

    // State variables
    IYieldMindVault public yieldMindVault;
    IUniswapV3StrategyAdapter public uniswapAdapter;

    mapping(address => Protocol) public protocols;
    address[] public protocolList;
    mapping(address => UserStrategy) public userStrategies;

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

    function _initializeNetwork() internal {
        uint256 chainId = block.chainid;

        if (chainId == 8453) {
            USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
        } else if (chainId == 84532) {
            USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
        } else if (chainId == 31337 || chainId == 1337) {
            USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
        } else {
            revert("Unsupported network");
        }
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "Invalid vault address");
        yieldMindVault = IYieldMindVault(_vault);
    }

    function setUSDC(address _usdc) external onlyOwner {
        USDC = _usdc;
    }


    function executeStrategy(uint256 amount, address token) external onlyVault nonReentrant {
        require(token == USDC || token == address(0), "Only USDC supported");
        address user = tx.origin;

        address selectedProtocol = _getOptimalProtocol(amount, token);
        string memory protocolName = protocols[selectedProtocol].name;

        UserStrategy storage strategy = userStrategies[user];
        strategy.depositToken = token;
        strategy.selectedProtocol = selectedProtocol;

        if (selectedProtocol != address(0)) {
            _deployToProtocol(selectedProtocol, token, amount, user);
            strategy.protocolAllocations[selectedProtocol] += amount;
        }

        strategy.totalValue += amount;
        strategy.lastRebalance = block.timestamp;

        emit StrategyExecuted(user, token, amount, protocolName);
    }

    function _getOptimalProtocol(uint256 amount, address token) internal view returns (address) {
        address bestProtocol = address(0);
        uint256 bestScore = 0;

        for (uint256 i = 0; i < protocolList.length; i++) {
            address protocolAddr = protocolList[i];
            Protocol memory protocol = protocols[protocolAddr];

            if (!protocol.isActive || block.timestamp > protocol.lastUpdate + DATA_VALIDITY_PERIOD) {
                continue;
            }

            uint256 score = (protocol.currentAPY * 100) / _sqrt(protocol.riskScore);

            if (keccak256(bytes(protocol.protocolType)) == keccak256(bytes("uniswap"))) {
                score = (score * 110) / 100;
            }

            if (score > bestScore) {
                bestScore = score;
                bestProtocol = protocolAddr;
            }
        }

        return bestProtocol;
    }

    function _deployToProtocol(address protocol, address token, uint256 amount, address user) internal {
        require(protocols[protocol].isActive, "Protocol not active");

        string memory protocolType = protocols[protocol].protocolType;

        if (keccak256(bytes(protocolType)) == keccak256(bytes("uniswap"))) {
            require(address(uniswapAdapter) != address(0), "Uniswap adapter not set");
            IERC20(token).safeTransfer(address(uniswapAdapter), amount);
            uniswapAdapter.depositUSDC(amount, user);
        } else if (keccak256(bytes(protocolType)) == keccak256(bytes("mock"))) {
            IERC20(token).approve(protocol, amount);
            IExternalProtocol(protocol).deposit(token, amount);
        } else {
            IERC20(token).approve(protocol, amount);
            IExternalProtocol(protocol).deposit(token, amount);
        }
    }

    function rebalancePortfolio(address user) external onlyVault nonReentrant {
        UserStrategy storage strategy = userStrategies[user];
        require(strategy.totalValue > 0, "No position to rebalance");

        uint256 currentValue = _calculatePortfolioValue(user);
        yieldMindVault.updatePositionValue(user, currentValue);

        strategy.totalValue = currentValue;
        strategy.lastRebalance = block.timestamp;

        emit PortfolioRebalanced(user, currentValue);
    }

    function _calculatePortfolioValue(address user) internal view returns (uint256) {
        UserStrategy storage strategy = userStrategies[user];

        if (strategy.selectedProtocol == address(0)) {
            return strategy.totalValue;
        }

        Protocol memory protocol = protocols[strategy.selectedProtocol];

        if (keccak256(bytes(protocol.protocolType)) == keccak256(bytes("uniswap"))) {
            return uniswapAdapter.getUserBalance(user);
        } else {
            return IExternalProtocol(strategy.selectedProtocol).getBalance(address(this), strategy.depositToken);
        }
    }


    function initializeUniswap(address _uniswapAdapter) external onlyOwner {
        uniswapAdapter = IUniswapV3StrategyAdapter(_uniswapAdapter);

        addProtocol(
            _uniswapAdapter,
            "Uniswap V3 USDC/WETH",
            "uniswap",
            1500, // Estimated APY for reference
            20,
            1000000000 * 1e6,
            true
        );
    }

    function addMockProtocol(
        address protocolAddress,
        string memory name,
        uint256 apy,
        uint256 riskScore
    ) external onlyOwner {
        addProtocol(protocolAddress, name, "mock", apy, riskScore, 100000 * 1e6, true);
    }

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

    function updateProtocolData(
        address protocol,
        uint256 newAPY,
        uint256 newRiskScore,
        uint256 newTVL
    ) external onlyOwner {
        require(protocols[protocol].protocolAddress != address(0), "Protocol not found");

        Protocol storage p = protocols[protocol];
        p.currentAPY = newAPY;
        p.riskScore = newRiskScore;
        p.tvl = newTVL;
        p.lastUpdate = block.timestamp;
    }


    /**
     * @dev Get user's ACTUAL performance based on real fees earned
     * This returns REAL DATA calculated from actual Uniswap fees collected over time
     */
    function getUserPerformance(address user) external view returns (
        uint256 totalDeposited,
        uint256 currentValue,
        uint256 totalFeesEarned, // REAL fees earned in USDC
        uint256 userAPY, // REAL APY based on actual fees
        uint256 daysActive,
        string memory selectedProtocolName
    ) {
        UserStrategy storage strategy = userStrategies[user];
        totalDeposited = strategy.totalValue;
        
        if (strategy.selectedProtocol == address(0)) {
            return (totalDeposited, totalDeposited, 0, 0, 0, "");
        }

        Protocol memory protocol = protocols[strategy.selectedProtocol];
        selectedProtocolName = protocol.name;
        daysActive = (block.timestamp - strategy.lastRebalance) / 86400;

        if (keccak256(bytes(protocol.protocolType)) == keccak256(bytes("uniswap"))) {
            if (address(uniswapAdapter) != address(0)) {
                try uniswapAdapter.getUserPerformance(user) returns (
                    uint256 depositAmount,
                    uint256 _currentValue,
                    uint256 _totalFees,
                    uint256 _userAPY,
                    uint256 _daysActive,
                    int256
                ) {
                    totalDeposited = depositAmount;
                    currentValue = _currentValue;
                    totalFeesEarned = _totalFees; // REAL fees
                    userAPY = _userAPY; // REAL APY
                    daysActive = _daysActive;
                } catch {
                    currentValue = totalDeposited;
                    userAPY = 0;
                }
            }
        } else {
            // For non-Uniswap protocols, estimate based on protocol APY
            if (daysActive > 0) {
                uint256 estimatedReturn = (totalDeposited * protocol.currentAPY * daysActive) / (365 * 10000);
                currentValue = totalDeposited + estimatedReturn;
                userAPY = protocol.currentAPY;
            } else {
                currentValue = totalDeposited;
                userAPY = protocol.currentAPY;
            }
        }

        return (totalDeposited, currentValue, totalFeesEarned, userAPY, daysActive, selectedProtocolName);
    }

    /**
     * @dev Get user's actual APY from Uniswap position
     */
    function getUserAPY(address user) external view returns (
        uint256 userAPY,
        uint256 totalFeesEarned,
        uint256 daysActive,
        uint256 dailyReturn
    ) {
        UserStrategy storage strategy = userStrategies[user];
        
        if (strategy.selectedProtocol == address(0)) {
            return (0, 0, 0, 0);
        }

        Protocol memory protocol = protocols[strategy.selectedProtocol];

        if (keccak256(bytes(protocol.protocolType)) == keccak256(bytes("uniswap"))) {
            if (address(uniswapAdapter) != address(0)) {
                try uniswapAdapter.getUserAPY(user) returns (
                    uint256 _userAPY,
                    uint256 _totalFees,
                    uint256 _daysActive,
                    uint256 _dailyReturn
                ) {
                    return (_userAPY, _totalFees, _daysActive, _dailyReturn);
                } catch {
                    return (0, 0, 0, 0);
                }
            }
        }

        return (protocol.currentAPY, 0, 0, 0);
    }

    /**
     * @dev Get all protocols info
     */
    function getAllProtocols() external view returns (
        address[] memory addresses,
        string[] memory names,
        string[] memory types,
        uint256[] memory apys,
        uint256[] memory riskScores,
        bool[] memory activeStatus
    ) {
        uint256 length = protocolList.length;
        
        addresses = new address[](length);
        names = new string[](length);
        types = new string[](length);
        apys = new uint256[](length);
        riskScores = new uint256[](length);
        activeStatus = new bool[](length);

        for (uint256 i = 0; i < length; i++) {
            address protocolAddr = protocolList[i];
            Protocol memory protocol = protocols[protocolAddr];
            
            addresses[i] = protocolAddr;
            names[i] = protocol.name;
            types[i] = protocol.protocolType;
            apys[i] = protocol.currentAPY;
            riskScores[i] = protocol.riskScore;
            activeStatus[i] = protocol.isActive;
        }

        return (addresses, names, types, apys, riskScores, activeStatus);
    }


    function withdrawFromProtocol(address user, uint256 percentage) external onlyVault nonReentrant {
        require(percentage > 0 && percentage <= 100, "Invalid percentage");

        UserStrategy storage strategy = userStrategies[user];
        require(strategy.selectedProtocol != address(0), "No protocol selected");

        Protocol memory protocol = protocols[strategy.selectedProtocol];

        if (keccak256(bytes(protocol.protocolType)) == keccak256(bytes("uniswap"))) {
            uniswapAdapter.withdrawUserPosition(user, percentage);
        } else {
            uint256 withdrawAmount = (strategy.protocolAllocations[strategy.selectedProtocol] * percentage) / 100;
            IExternalProtocol(strategy.selectedProtocol).withdraw(strategy.depositToken, withdrawAmount);
        }

        if (percentage == 100) {
            strategy.totalValue = 0;
            strategy.protocolAllocations[strategy.selectedProtocol] = 0;
            strategy.selectedProtocol = address(0);
        } else {
            uint256 remainingAllocation = (strategy.protocolAllocations[strategy.selectedProtocol] * (100 - percentage)) / 100;
            strategy.protocolAllocations[strategy.selectedProtocol] = remainingAllocation;
            strategy.totalValue = (strategy.totalValue * (100 - percentage)) / 100;
        }
    }

    function collectFeesForUser(address user) external {
        UserStrategy storage strategy = userStrategies[user];

        if (strategy.selectedProtocol != address(0)) {
            Protocol memory protocol = protocols[strategy.selectedProtocol];

            if (keccak256(bytes(protocol.protocolType)) == keccak256(bytes("uniswap"))) {
                uniswapAdapter.collectFees(user);
            }
        }
    }


    function getUserStrategy(address user) external view returns (
        uint256 totalValue,
        uint256 lastRebalance,
        address depositToken,
        address selectedProtocol,
        string memory protocolName
    ) {
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

    function getProtocolInfo(address protocol) external view returns (
        address protocolAddress,
        string memory name,
        string memory protocolType,
        uint256 currentAPY,
        uint256 riskScore,
        uint256 tvl,
        bool isActive,
        uint256 lastUpdate
    ) {
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

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

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