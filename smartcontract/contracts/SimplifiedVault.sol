// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IMINDStaking {
    function getUserTier(address user) external view returns (uint8);
}

contract SimplifiedVault is ReentrancyGuard, Ownable, Pausable {
    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    // Structs
    struct UserPosition {
        uint256 principal;       // Original USDC deposit amount
        uint256 currentValue;    // Current position value (principal + rewards)
        uint256 lastUpdateTime;  // Last update timestamp
        uint256 totalReturns;    // Lifetime returns
    }

    // State variables
    IERC20 public usdc;  // USDC token on Base
    IMINDStaking public mindStaking;

    mapping(address => UserPosition) public userPositions;
    mapping(uint8 => uint256) public tierLimits; // Tier => max deposit limit

    uint256 public totalValueLocked;
    uint256 public totalFeesCollected;

    // Tier-based rebalancing frequencies (in seconds)
    mapping(uint8 => uint256) public rebalanceFrequency;

    // Deposit limits (in USDC, 6 decimals!)
    uint256 public constant MIN_DEPOSIT = 10 * 1e6;     // 10 USDC
    uint256 public constant MAX_DEPOSIT = 1_000_000 * 1e6; // 1M USDC

    constructor(address _usdc, address _mindStaking) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        mindStaking = IMINDStaking(_mindStaking);

        // Initialize tier limits (example: scaled to USDC 6 decimals)
        tierLimits[0] = 10_000 * 1e6;     // Free: 10k USDC max
        tierLimits[1] = 100_000 * 1e6;    // Premium: 100k USDC max
        tierLimits[2] = 1_000_000 * 1e6;  // Pro: 1M USDC max

        // Rebalancing frequencies
        rebalanceFrequency[0] = 86400; // 24 hours
        rebalanceFrequency[1] = 14400; // 4 hours
        rebalanceFrequency[2] = 3600;  // 1 hour
    }

    // -------- Core Functions -------- //

    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_DEPOSIT, "Below minimum deposit");
        require(amount <= MAX_DEPOSIT, "Exceeds maximum deposit");

        uint8 userTier = mindStaking.getUserTier(msg.sender);

        // Check tier limits
        UserPosition storage position = userPositions[msg.sender];
        uint256 newTotal = position.principal + amount;
        require(newTotal <= tierLimits[userTier], "Exceeds tier limit");

        // Transfer USDC from user
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        // Update user position
        position.principal += amount;
        position.currentValue += amount;
        position.lastUpdateTime = block.timestamp;

        // Update total value locked
        totalValueLocked += amount;

        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        UserPosition storage position = userPositions[msg.sender];
        require(position.principal >= amount, "Insufficient balance");

        // Update user position
        position.principal -= amount;
        position.currentValue -= amount;
        position.lastUpdateTime = block.timestamp;

        // Update total value locked
        totalValueLocked -= amount;

        // Transfer USDC back to user
        require(usdc.transfer(msg.sender, amount), "USDC transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    // Mock rewards logic (placeholder – in real case integrate with Base DeFi protocols)
    function claimRewards() external nonReentrant {
        UserPosition storage position = userPositions[msg.sender];
        require(position.principal > 0, "No position");

        uint256 rewards = (position.principal * 2) / 1000; // e.g., 0.2% dummy reward
        if (rewards > 0) {
            position.currentValue += rewards;
            position.totalReturns += rewards;
            position.lastUpdateTime = block.timestamp;

            require(usdc.transfer(msg.sender, rewards), "USDC transfer failed");

            emit RewardsClaimed(msg.sender, rewards);
        }
    }

    // -------- View Functions -------- //

    function getUserPositionValue(address user) external view returns (uint256) {
        return userPositions[user].currentValue;
    }

    function getPendingRewards(address user) external view returns (uint256) {
        return (userPositions[user].principal * 2) / 1000; // mock rewards
    }

    function getTotalValueLocked() external view returns (uint256) {
        return totalValueLocked;
    }

    // -------- Admin Controls -------- //

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function updateTierLimit(uint8 tier, uint256 newLimit) external onlyOwner {
        require(tier <= 2, "Invalid tier");
        tierLimits[tier] = newLimit;
    }

    function updateUSDC(address newUSDC) external onlyOwner {
        require(newUSDC != address(0), "Invalid USDC address");
        usdc = IERC20(newUSDC);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        require(usdc.transfer(owner(), balance), "USDC transfer failed");
    }
}
