// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IYieldMindVault {
    function updatePositionValue(address user, uint256 newValue) external;
}

interface IExternalProtocol {
    function deposit(address token, uint256 amount) external returns (uint256);
    function withdraw(address token, uint256 amount) external returns (uint256);
    function getBalance(address user, address token) external view returns (uint256);
}

contract AIStrategyManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Events
    event StrategyExecuted(address indexed user, address indexed token, uint256 amount);
    event PortfolioRebalanced(address indexed user, uint256 newValue);
    event ProtocolAdded(address indexed protocol, string name);
    event AllocationUpdated(address indexed protocol, uint256 newAllocation);
    
    // Structs
    struct Protocol {
        address protocolAddress;
        string name;
        uint256 currentAPY;          // APY in basis points (100 = 1%)
        uint256 riskScore;           // Risk score 1-100 (1=safest)
        uint256 tvl;                 // Total Value Locked
        bool isActive;
        uint256 allocation;          // Percentage allocation (basis points)
        uint256 lastUpdate;          // Last data update timestamp
    }
    
    struct UserStrategy {
        mapping(address => uint256) protocolAllocations; // protocol => amount
        uint256 totalValue;
        uint256 lastRebalance;
        address depositToken;
    }
    
    // State variables
    IYieldMindVault public immutable yieldMindVault;
    
    mapping(address => Protocol) public protocols;
    address[] public protocolList;
    mapping(address => UserStrategy) public userStrategies;
    
    // AI Strategy Parameters
    uint256 public constant MAX_PROTOCOLS_PER_STRATEGY = 5;
    uint256 public constant MIN_ALLOCATION_PERCENTAGE = 500; // 5%
    uint256 public constant REBALANCE_THRESHOLD = 1000; // 10% change triggers rebalance
    
    // Oracle settings
    address public dataOracle;
    uint256 public constant DATA_VALIDITY_PERIOD = 1 hours;
    
    modifier onlyVault() {
        require(msg.sender == address(yieldMindVault), "Only vault can call");
        _;
    }
    
    constructor(address _yieldMindVault) {
        yieldMindVault = IYieldMindVault(_yieldMindVault);
    }
    
    /**
     * @dev Execute AI-recommended strategy for user deposit
     */
    function executeStrategy(uint256 amount, address token) 
        external 
        onlyVault 
        nonReentrant 
    {
        address user = tx.origin; // Get original caller (user)
        
        // Get optimal allocation from AI engine
        address[] memory selectedProtocols = _getOptimalProtocols(amount, token);
        uint256[] memory allocations = _calculateAllocations(selectedProtocols, amount);
        
        UserStrategy storage strategy = userStrategies[user];
        strategy.depositToken = token;
        
        // Deploy funds to selected protocols
        for (uint256 i = 0; i < selectedProtocols.length; i++) {
            if (allocations[i] > 0) {
                _deployToProtocol(selectedProtocols[i], token, allocations[i]);
                strategy.protocolAllocations[selectedProtocols[i]] += allocations[i];
            }
        }
        
        strategy.totalValue += amount;
        strategy.lastRebalance = block.timestamp;
        
        emit StrategyExecuted(user, token, amount);
    }
    
    /**
     * @dev Rebalance user's portfolio based on new AI recommendations
     */
    function rebalancePortfolio(address user) external onlyVault nonReentrant {
        UserStrategy storage strategy = userStrategies[user];
        require(strategy.totalValue > 0, "No position to rebalance");
        
        // Calculate current portfolio value
        uint256 currentValue = _calculatePortfolioValue(user);
        
        // Get new optimal allocation
        address[] memory newProtocols = _getOptimalProtocols(currentValue, strategy.depositToken);
        uint256[] memory newAllocations = _calculateAllocations(newProtocols, currentValue);
        
        // Withdraw from underweight protocols
        _withdrawFromUnderweightProtocols(user, newProtocols, newAllocations);
        
        // Deploy to new/overweight protocols
        _deployToOptimalProtocols(user, newProtocols, newAllocations);
        
        // Update portfolio value
        strategy.totalValue = currentValue;
        strategy.lastRebalance = block.timestamp;
        
        // Update vault with new value
        yieldMindVault.updatePositionValue(user, currentValue);
        
        emit PortfolioRebalanced(user, currentValue);
    }
    
    /**
     * @dev Get optimal protocols based on AI analysis
     * This is simplified - in production, this would call external AI service
     */
    function _getOptimalProtocols(uint256 amount, address token) 
        internal 
        view 
        returns (address[] memory) 
    {
        // Simplified AI logic: select top 3 protocols by risk-adjusted yield
        address[] memory optimal = new address[](3);
        uint256[] memory scores = new uint256[](3);
        
        for (uint256 i = 0; i < protocolList.length; i++) {
            address protocolAddr = protocolList[i];
            Protocol memory protocol = protocols[protocolAddr];
            
            if (!protocol.isActive || 
                block.timestamp > protocol.lastUpdate + DATA_VALIDITY_PERIOD) {
                continue;
            }
            
            // Risk-adjusted score: APY / sqrt(riskScore)
            uint256 score = (protocol.currentAPY * 100) / _sqrt(protocol.riskScore);
            
            // Insert into top 3
            for (uint256 j = 0; j < 3; j++) {
                if (score > scores[j]) {
                    // Shift lower scores
                    for (uint256 k = 2; k > j; k--) {
                        scores[k] = scores[k-1];
                        optimal[k] = optimal[k-1];
                    }
                    scores[j] = score;
                    optimal[j] = protocolAddr;
                    break;
                }
            }
        }
        
        return optimal;
    }
    
    /**
     * @dev Calculate allocation percentages for selected protocols
     */
    function _calculateAllocations(address[] memory protocols, uint256 totalAmount) 
        internal 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory allocations = new uint256[](protocols.length);
        
        // Simplified allocation: distribute based on inverse risk
        uint256 totalInverseRisk = 0;
        for (uint256 i = 0; i < protocols.length; i++) {
            if (protocols[i] != address(0)) {
                totalInverseRisk += 100 - protocols[protocols[i]].riskScore;
            }
        }
        
        for (uint256 i = 0; i < protocols.length; i++) {
            if (protocols[i] != address(0)) {
                uint256 inverseRisk = 100 - protocols[protocols[i]].riskScore;
                allocations[i] = (totalAmount * inverseRisk) / totalInverseRisk;
            }
        }
        
        return allocations;
    }
    
    /**
     * @dev Deploy funds to specific protocol
     */
    function _deployToProtocol(address protocol, address token, uint256 amount) internal {
        require(protocols[protocol].isActive, "Protocol not active");
        
        IERC20(token).approve(protocol, amount);
        IExternalProtocol(protocol).deposit(token, amount);
    }
    
    /**
     * @dev Calculate current portfolio value for user
     */
    function _calculatePortfolioValue(address user) internal view returns (uint256) {
        UserStrategy storage strategy = userStrategies[user];
        uint256 totalValue = 0;
        
        for (uint256 i = 0; i < protocolList.length; i++) {
            address protocol = protocolList[i];
            uint256 allocation = strategy.protocolAllocations[protocol];
            
            if (allocation > 0) {
                uint256 currentBalance = IExternalProtocol(protocol).getBalance(
                    address(this), 
                    strategy.depositToken
                );
                totalValue += currentBalance;
            }
        }
        
        return totalValue;
    }
    
    /**
     * @dev Withdraw from underweight protocols
     */
    function _withdrawFromUnderweightProtocols(
        address user,
        address[] memory newProtocols,
        uint256[] memory newAllocations
    ) internal {
        // Implementation for rebalancing withdrawals
        // This would compare current vs target allocations
        // and withdraw excess from overallocated protocols
    }
    
    /**
     * @dev Deploy to optimal protocols
     */
    function _deployToOptimalProtocols(
        address user,
        address[] memory protocols,
        uint256[] memory allocations
    ) internal {
        // Implementation for rebalancing deposits
        // This would deploy withdrawn funds to underallocated protocols
    }
    
    /**
     * @dev Add new protocol to strategy options
     */
    function addProtocol(
        address protocolAddress,
        string memory name,
        uint256 initialAPY,
        uint256 riskScore,
        uint256 tvl
    ) external onlyOwner {
        require(protocolAddress != address(0), "Invalid protocol address");
        require(riskScore <= 100, "Risk score must be <= 100");
        
        protocols[protocolAddress] = Protocol({
            protocolAddress: protocolAddress,
            name: name,
            currentAPY: initialAPY,
            riskScore: riskScore,
            tvl: tvl,
            isActive: true,
            allocation: 0,
            lastUpdate: block.timestamp
        });
        
        protocolList.push(protocolAddress);
        
        emit ProtocolAdded(protocolAddress, name);
    }
    
    /**
     * @dev Update protocol data (called by oracle)
     */
    function updateProtocolData(
        address protocol,
        uint256 newAPY,
        uint256 newRiskScore,
        uint256 newTVL
    ) external {
        require(msg.sender == dataOracle || msg.sender == owner(), "Unauthorized");
        require(protocols[protocol].protocolAddress != address(0), "Protocol not found");
        
        Protocol storage p = protocols[protocol];
        p.currentAPY = newAPY;
        p.riskScore = newRiskScore;
        p.tvl = newTVL;
        p.lastUpdate = block.timestamp;
    }
    
    /**
     * @dev Set data oracle address
     */
    function setDataOracle(address _oracle) external onlyOwner {
        dataOracle = _oracle;
    }
    
    /**
     * @dev Get user's current strategy
     */
    function getUserStrategy(address user) 
        external 
        view 
        returns (
            uint256 totalValue,
            uint256 lastRebalance,
            address depositToken
        ) 
    {
        UserStrategy storage strategy = userStrategies[user];
        return (
            strategy.totalValue,
            strategy.lastRebalance,
            strategy.depositToken
        );
    }
    
    /**
     * @dev Square root function (for risk calculations)
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