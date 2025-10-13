// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
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

contract NeuroWealthVault is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event StrategyExecuted(address indexed user, uint256 amount);
    event PerformanceFeeCollected(address indexed user, uint256 feeAmount);

    // Structs
    struct UserPosition {
        uint256 principal; // Original USDC deposit amount
        uint256 currentValue; // Current position value
        uint256 lastUpdateTime; // Last rebalance timestamp
        uint256 totalReturns; // Lifetime returns
    }

    // USDC token - can be set in constructor for testing
    IERC20 public immutable USDC;

    // State variables
    mapping(address => UserPosition) public userPositions;
    mapping(uint8 => uint256) public tierLimits; // Tier => max deposit limit

    // USDC limits for Base
    uint256 public constant MIN_DEPOSIT = 10 * 1e6; // 10 USDC minimum
    uint256 public constant MAX_DEPOSIT = 100000 * 1e6; // 100,000 USDC maximum

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
        address _strategyManager,
        address _usdc // Added USDC parameter for testing
    ) Ownable(msg.sender) {
        mindStaking = IMINDStaking(_mindStaking);
        strategyManager = IAIStrategyManager(_strategyManager);
        USDC = IERC20(_usdc);

        // Initialize tier limits in USDC
        tierLimits[0] = 10000 * 1e6; // Free: $10k max
        tierLimits[1] = 100000 * 1e6; // Premium: $100k max
        tierLimits[2] = 1000000 * 1e6; // Pro: $1M max

        // Initialize rebalancing frequencies
        rebalanceFrequency[0] = 86400; // Free: 24 hours
        rebalanceFrequency[1] = 14400; // Premium: 4 hours
        rebalanceFrequency[2] = 3600; // Pro: 1 hour
    }

    /**
     * @dev Deposit USDC into NeuroWealth for optimization
     * @param amount Amount of USDC to deposit
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_DEPOSIT, "Below minimum deposit");
        require(amount <= MAX_DEPOSIT, "Exceeds maximum deposit");

        uint8 userTier = mindStaking.getUserTier(msg.sender);

        // Check tier limits
        UserPosition storage position = userPositions[msg.sender];
        uint256 newTotal = position.principal + amount;
        require(newTotal <= tierLimits[userTier], "Exceeds tier limit");

        // Transfer USDC from user
        USDC.safeTransferFrom(msg.sender, address(this), amount);

        // Update user position
        if (position.principal == 0) {
            position.principal = amount;
            position.currentValue = amount;
            position.lastUpdateTime = block.timestamp;
        } else {
            position.principal += amount;
            position.currentValue += amount;
        }

        totalValueLocked += amount;

        // Execute AI strategy
        if (address(strategyManager) != address(0)) {
            USDC.safeTransfer(address(strategyManager), amount);
            strategyManager.executeStrategy(amount, address(USDC));
        }

        emit Deposit(msg.sender, amount);
        emit StrategyExecuted(msg.sender, amount);
    }

    /**
     * @dev Withdraw USDC from NeuroWealth
     * @param amount Amount to withdraw (0 = withdraw all)
     */
    function withdraw(uint256 amount) external nonReentrant {
        UserPosition storage position = userPositions[msg.sender];
        require(position.principal > 0, "No position found");

        uint256 withdrawAmount = amount == 0 ? position.currentValue : amount;
        require(
            withdrawAmount <= position.currentValue,
            "Insufficient balance"
        );

        // Calculate performance fee on profits only
        uint256 profitToWithdraw = 0;
        if (withdrawAmount > position.principal) {
            profitToWithdraw = withdrawAmount - position.principal;
        }

        uint256 performanceFee = (profitToWithdraw * PERFORMANCE_FEE) /
            FEE_DENOMINATOR;
        uint256 userReceives = withdrawAmount - performanceFee;

        // Check vault USDC balance and get funds from strategy manager if needed
        uint256 vaultBalance = USDC.balanceOf(address(this));
        if (vaultBalance < userReceives) {
            // In production, you would call strategy manager to withdraw funds
            // For testing, we'll just revert with a clear message
            revert("Insufficient vault balance - funds in strategy");
        }

        // Update position
        if (withdrawAmount == position.currentValue) {
            delete userPositions[msg.sender];
        } else {
            // Calculate how much principal and current value remain
            uint256 withdrawnPrincipal = (position.principal * withdrawAmount) /
                position.currentValue;

            // Ensure we don't underflow
            if (withdrawnPrincipal > position.principal) {
                withdrawnPrincipal = position.principal;
            }

            position.principal -= withdrawnPrincipal;
            position.currentValue -= withdrawAmount;
        }

        // Ensure we don't underflow on TVL
        if (withdrawAmount > totalValueLocked) {
            totalValueLocked = 0;
        } else {
            totalValueLocked -= withdrawAmount;
        }

        totalFeesCollected += performanceFee;

        USDC.safeTransfer(msg.sender, userReceives);

        if (performanceFee > 0) {
            emit PerformanceFeeCollected(msg.sender, performanceFee);
        }

        emit Withdrawal(msg.sender, userReceives);
    }

    /**
     * @dev Update user's position value (called by strategy manager or owner for testing)
     */
    function updatePositionValue(
        address user,
        uint256 newValue
    ) external onlyStrategyManagerOrOwner {
        UserPosition storage position = userPositions[user];
        require(position.principal > 0, "No position found");
        position.currentValue = newValue;

        if (newValue > position.principal) {
            position.totalReturns = newValue - position.principal;
        }
    }

    /**
     * @dev Get user's current position info
     */
    function getUserPosition(
        address user
    )
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

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    modifier onlyStrategyManager() {
        require(
            msg.sender == address(strategyManager),
            "Only strategy manager"
        );
        _;
    }

    // ADDED: New modifier for testing
    modifier onlyStrategyManagerOrOwner() {
        require(
            msg.sender == address(strategyManager) || msg.sender == owner(),
            "Only strategy manager or owner"
        );
        _;
    }
}