// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IMIND {
    function mint(address to, uint256 amount) external;
}

contract MINDStaking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint8 newTier);
    event Unstaked(address indexed user, uint256 amount, uint8 newTier);
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDistributed(uint256 amount);
    
    // Structs
    struct UserStake {
        uint256 amount;           // MIND tokens staked
        uint256 stakingTime;      // When user started staking
        uint256 lastClaimTime;    // Last reward claim time
        uint256 accumulatedRewards; // Pending rewards
        uint8 tier;               // Current tier (0=Free, 1=Premium, 2=Pro)
    }
    
    // State variables
    IERC20 public immutable mindToken;
    
    mapping(address => UserStake) public userStakes;
    
    // Tier requirements
    uint256 public constant PREMIUM_THRESHOLD = 100 * 1e18;    // 100 MIND
    uint256 public constant PRO_THRESHOLD = 500 * 1e18;        // 500 MIND
    
    // Reward rates (per second, in MIND tokens)
    uint256 public constant BASE_REWARD_RATE = 1e15;           // Base rate
    uint256 public constant PREMIUM_MULTIPLIER = 150;          // 1.5x
    uint256 public constant PRO_MULTIPLIER = 200;              // 2x
    uint256 public constant MULTIPLIER_DENOMINATOR = 100;
    
    // Staking mechanics
    uint256 public constant MIN_STAKE_DURATION = 7 days;       // 7 days minimum
    uint256 public constant UNSTAKE_COOLDOWN = 3 days;         // 3 days cooldown
    
    mapping(address => uint256) public unstakeRequestTime;
    
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    
    constructor(address _mindToken) {
        mindToken = IERC20(_mindToken);
    }
    
    /**
     * @dev Stake MIND tokens to unlock tiers
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        
        UserStake storage userStake = userStakes[msg.sender];
        
        // Claim pending rewards first
        _claimRewards(msg.sender);
        
        // Transfer tokens from user
        mindToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update user stake
        if (userStake.amount == 0) {
            userStake.stakingTime = block.timestamp;
            userStake.lastClaimTime = block.timestamp;
        }
        
        userStake.amount += amount;
        totalStaked += amount;
        
        // Update tier
        uint8 newTier = _calculateTier(userStake.amount);
        userStake.tier = newTier;
        
        emit Staked(msg.sender, amount, newTier);
    }
    
    /**
     * @dev Request to unstake MIND tokens
     */
    function requestUnstake() external {
        UserStake storage userStake = userStakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        require(
            block.timestamp >= userStake.stakingTime + MIN_STAKE_DURATION,
            "Minimum stake duration not met"
        );
        
        unstakeRequestTime[msg.sender] = block.timestamp;
    }
    
    /**
     * @dev Execute unstake after cooldown
     */
    function unstake(uint256 amount) external nonReentrant {
        UserStake storage userStake = userStakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient stake");
        require(unstakeRequestTime[msg.sender] > 0, "Must request unstake first");
        require(
            block.timestamp >= unstakeRequestTime[msg.sender] + UNSTAKE_COOLDOWN,
            "Cooldown period not finished"
        );
        
        // Claim pending rewards first
        _claimRewards(msg.sender);
        
        // Update stake
        userStake.amount -= amount;
        totalStaked -= amount;
        
        // Update tier
        uint8 newTier = _calculateTier(userStake.amount);
        userStake.tier = newTier;
        
        // Reset unstake request if fully unstaked
        if (userStake.amount == 0) {
            delete userStakes[msg.sender];
            delete unstakeRequestTime[msg.sender];
        } else {
            delete unstakeRequestTime[msg.sender];
        }
        
        // Transfer tokens back to user
        mindToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount, newTier);
    }
    
    /**
     * @dev Claim accumulated staking rewards
     */
    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }
    
    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards(address user) internal {
        UserStake storage userStake = userStakes[user];
        if (userStake.amount == 0) return;
        
        uint256 rewards = calculatePendingRewards(user);
        if (rewards == 0) return;
        
        userStake.lastClaimTime = block.timestamp;
        userStake.accumulatedRewards = 0;
        totalRewardsDistributed += rewards;
        
        // Mint new MIND tokens as rewards
        IMIND(address(mindToken)).mint(user, rewards);
        
        emit RewardsClaimed(user, rewards);
    }
    
    /**
     * @dev Calculate pending rewards for user
     */
    function calculatePendingRewards(address user) public view returns (uint256) {
        UserStake memory userStake = userStakes[user];
        if (userStake.amount == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - userStake.lastClaimTime;
        uint256 baseRewards = stakingDuration * BASE_REWARD_RATE * userStake.amount / 1e18;
        
        // Apply tier multiplier
        uint256 multiplier = MULTIPLIER_DENOMINATOR;
        if (userStake.tier == 1) {
            multiplier = PREMIUM_MULTIPLIER;
        } else if (userStake.tier == 2) {
            multiplier = PRO_MULTIPLIER;
        }
        
        return (baseRewards * multiplier) / MULTIPLIER_DENOMINATOR + userStake.accumulatedRewards;
    }
    
    /**
     * @dev Calculate tier based on staked amount
     */
    function _calculateTier(uint256 stakedAmount) internal pure returns (uint8) {
        if (stakedAmount >= PRO_THRESHOLD) return 2;      // Pro
        if (stakedAmount >= PREMIUM_THRESHOLD) return 1;  // Premium
        return 0; // Free
    }
    
    /**
     * @dev Get user's current tier
     */
    function getUserTier(address user) external view returns (uint8) {
        return userStakes[user].tier;
    }
    
    /**
     * @dev Get user's staking info
     */
    function getUserStakeInfo(address user) 
        external 
        view 
        returns (
            uint256 amount,
            uint256 stakingTime,
            uint8 tier,
            uint256 pendingRewards,
            bool canUnstake
        ) 
    {
        UserStake memory userStake = userStakes[user];
        uint256 rewards = calculatePendingRewards(user);
        bool unstakeable = block.timestamp >= userStake.stakingTime + MIN_STAKE_DURATION;
        
        return (
            userStake.amount,
            userStake.stakingTime,
            userStake.tier,
            rewards,
            unstakeable
        );
    }
}