// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IMINDStaking {
    function getUserTier(address user) external view returns (uint8);
}

interface IAIStrategyManager {
    function executeStrategy(uint256 amount, address token) external;
    function rebalancePortfolio(address user) external;
}

contract YieldMindVault is ReentrancyGuard, Ownable, Pausable {
    
    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event StrategyExecuted(address indexed user, uint256 amount);
    event PerformanceFeeCollected(address indexed user, uint256 feeAmount);
    
    // Structs
    struct UserPosition {
        uint256 principal;           // Original STT deposit amount
        uint256 currentValue;        // Current position value
        uint256 lastUpdateTime;      // Last rebalance timestamp
        uint256 totalReturns;        // Lifetime returns
    }
    
    // State variables
    mapping(address => UserPosition) public userPositions;
    mapping(uint8 => uint256) public tierLimits; // Tier => max deposit limit
    
    // STT-specific limits
    uint256 public constant MIN_DEPOSIT = 0.1 ether; // 0.1 STT minimum
    uint256 public constant MAX_DEPOSIT = 1000 ether; // 1000 STT maximum
    
    IMINDStaking public mindStaking;
    IAIStrategyManager public strategyManager;
    
    uint256 public constant PERFORMANCE_FEE = 50; // 0.5% (50/10000)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    uint256 public totalValueLocked;
    uint256 public totalFeesCollected;
    
    // Tier-based rebalancing frequencies (in seconds)
    mapping(uint8 => uint256) public rebalanceFrequency;
    
    constructor(
        address _mindStaking,
        address _strategyManager
    ) Ownable(msg.sender) {
        mindStaking = IMINDStaking(_mindStaking);
        strategyManager = IAIStrategyManager(_strategyManager);
        
        // Initialize tier limits
        tierLimits[0] = 10000 * 1e18;      // Free: $10k max
        tierLimits[1] = 100000 * 1e18;     // Premium: $100k max  
        tierLimits[2] = 1000000 * 1e18;    // Pro: $1M max
        
        // Initialize rebalancing frequencies
        rebalanceFrequency[0] = 86400;     // Free: 24 hours
        rebalanceFrequency[1] = 14400;     // Premium: 4 hours
        rebalanceFrequency[2] = 3600;      // Pro: 1 hour
    }
    
    /**
     * @dev Deposit STT into YieldMind for optimization
     * @param amount Amount of STT to deposit
     */
    function deposit(uint256 amount) 
        external 
        payable
        nonReentrant 
        whenNotPaused 
    {
        require(msg.value == amount, "Incorrect STT amount");
        require(amount >= MIN_DEPOSIT, "Below minimum deposit");
        require(amount <= MAX_DEPOSIT, "Exceeds maximum deposit");
        
        uint8 userTier = mindStaking.getUserTier(msg.sender);
        
        // Check tier limits
        UserPosition storage position = userPositions[msg.sender];
        uint256 newTotal = position.principal + amount;
        require(newTotal <= tierLimits[userTier], "Exceeds tier limit");
        
        // Update user position
        if (position.principal == 0) {
            // First deposit
            position.principal = amount;
            position.currentValue = amount;
            position.lastUpdateTime = block.timestamp;
        } else {
            // Additional deposit
            position.principal += amount;
            position.currentValue += amount;
        }
        
        totalValueLocked += amount;
        
        // Execute AI strategy (if strategy manager is set)
        if (address(strategyManager) != address(0)) {
            // Send STT to strategy manager
            (bool success, ) = address(strategyManager).call{value: amount}("");
            require(success, "Strategy execution failed");
            strategyManager.executeStrategy(amount, address(0)); // address(0) for native token
        }
        
        emit Deposit(msg.sender, amount);
        emit StrategyExecuted(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw tokens from YieldMind
     * @param amount Amount to withdraw (0 = withdraw all)
     */
    function withdraw(uint256 amount) 
        external 
        nonReentrant 
    {
        UserPosition storage position = userPositions[msg.sender];
        require(position.principal > 0, "No position found");
        
        uint256 withdrawAmount = amount == 0 ? position.currentValue : amount;
        require(withdrawAmount <= position.currentValue, "Insufficient balance");
        
        // Calculate performance fee on profits only
        uint256 profit = position.currentValue > position.principal ? 
            position.currentValue - position.principal : 0;
        
        uint256 profitToWithdraw = withdrawAmount > position.principal ?
            withdrawAmount - position.principal : 0;
            
        uint256 performanceFee = (profitToWithdraw * PERFORMANCE_FEE) / FEE_DENOMINATOR;
        uint256 userReceives = withdrawAmount - performanceFee;
        
        // Update position
        if (withdrawAmount == position.currentValue) {
            // Full withdrawal
            delete userPositions[msg.sender];
        } else {
            // Partial withdrawal
            uint256 remainingRatio = (position.currentValue - withdrawAmount) * 1e18 / position.currentValue;
            position.principal = (position.principal * remainingRatio) / 1e18;
            position.currentValue -= withdrawAmount;
        }
        
        totalValueLocked -= withdrawAmount;
        totalFeesCollected += performanceFee;
        
        // Transfer STT to user
        (bool success, ) = msg.sender.call{value: userReceives}("");
        require(success, "STT transfer failed");
        
        if (performanceFee > 0) {
            emit PerformanceFeeCollected(msg.sender, performanceFee);
        }
        
        emit Withdrawal(msg.sender, userReceives);
    }
    
    /**
     * @dev Trigger rebalancing for user's position
     */
    function rebalance() external {
        UserPosition storage position = userPositions[msg.sender];
        require(position.principal > 0, "No position found");
        
        uint8 userTier = mindStaking.getUserTier(msg.sender);
        uint256 timeSinceLastRebalance = block.timestamp - position.lastUpdateTime;
        
        require(
            timeSinceLastRebalance >= rebalanceFrequency[userTier], 
            "Rebalancing too frequent for your tier"
        );
        
        position.lastUpdateTime = block.timestamp;
        strategyManager.rebalancePortfolio(msg.sender);
    }
    
    /**
     * @dev Update user's position value (called by strategy manager)
     */
    function updatePositionValue(address user, uint256 newValue) 
        external 
        onlyStrategyManager 
    {
        UserPosition storage position = userPositions[user];
        position.currentValue = newValue;
        
        if (newValue > position.principal) {
            position.totalReturns = newValue - position.principal;
        }
    }
    
    // STT-only contract - no token management needed
    
    /**
     * @dev Update strategy manager address
     */
    function setStrategyManager(address _strategyManager) external onlyOwner {
        strategyManager = IAIStrategyManager(_strategyManager);
    }
    
    /**
     * @dev Get user's current position info
     */
    function getUserPosition(address user) 
        external 
        view 
        returns (
            uint256 principal,
            uint256 currentValue,
            uint256 totalReturns,
            uint8 userTier
        ) 
    {
        UserPosition memory position = userPositions[user];
        uint8 tier = mindStaking.getUserTier(user);
        
        return (
            position.principal,
            position.currentValue,
            position.totalReturns,
            tier
        );
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    modifier onlyStrategyManager() {
        require(msg.sender == address(strategyManager), "Only strategy manager");
        _;
    }
}