// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockMindStaking
 * @dev Mock contract that simulates MindStaking functionality for testing
 * This provides the getUserTier function that YieldMindVault expects
 */
contract MockMindStaking is Ownable {
    
    // Events
    event UserTierSet(address indexed user, uint8 tier);
    event StakingAmountSet(address indexed user, uint256 amount);
    
    // User staking data
    struct UserStakingData {
        uint256 stakedAmount;
        uint8 tier; // 0 = Free, 1 = Premium, 2 = Pro
        uint256 lastStakeTime;
        bool isActive;
    }
    
    mapping(address => UserStakingData) public userStakingData;
    
    // Tier requirements (in MIND tokens)
    uint256 public constant FREE_TIER_MIN = 0;           // 0 MIND
    uint256 public constant PREMIUM_TIER_MIN = 1000;     // 1000 MIND
    uint256 public constant PRO_TIER_MIN = 10000;        // 10000 MIND
    
    // Tier limits
    uint256 public constant FREE_TIER_LIMIT = 10000 * 1e18;      // $10k max
    uint256 public constant PREMIUM_TIER_LIMIT = 100000 * 1e18;  // $100k max
    uint256 public constant PRO_TIER_LIMIT = 1000000 * 1e18;     // $1M max
    
    constructor() Ownable(msg.sender) {
        // Initialize with default values
    }
    
    /**
     * @dev Get user tier based on staked amount
     * @param user User address
     * @return tier User's tier (0=Free, 1=Premium, 2=Pro)
     */
    function getUserTier(address user) external view returns (uint8) {
        UserStakingData memory userData = userStakingData[user];
        
        if (!userData.isActive) {
            return 0; // Default to Free tier
        }
        
        if (userData.stakedAmount >= PRO_TIER_MIN) {
            return 2; // Pro tier
        } else if (userData.stakedAmount >= PREMIUM_TIER_MIN) {
            return 1; // Premium tier
        } else {
            return 0; // Free tier
        }
    }
    
    /**
     * @dev Get user staking data
     * @param user User address
     * @return stakedAmount Amount staked
     * @return tier Current tier
     * @return lastStakeTime Last stake timestamp
     * @return isActive Whether user is active
     */
    function getUserStakingData(address user) external view returns (
        uint256 stakedAmount,
        uint8 tier,
        uint256 lastStakeTime,
        bool isActive
    ) {
        UserStakingData memory userData = userStakingData[user];
        return (
            userData.stakedAmount,
            userData.tier,
            userData.lastStakeTime,
            userData.isActive
        );
    }
    
    /**
     * @dev Set user tier (for testing)
     * @param user User address
     * @param tier Tier to set (0=Free, 1=Premium, 2=Pro)
     */
    function setUserTier(address user, uint8 tier) external onlyOwner {
        require(tier <= 2, "Invalid tier");
        
        userStakingData[user].tier = tier;
        userStakingData[user].isActive = true;
        
        // Set staked amount based on tier
        if (tier == 2) {
            userStakingData[user].stakedAmount = PRO_TIER_MIN;
        } else if (tier == 1) {
            userStakingData[user].stakedAmount = PREMIUM_TIER_MIN;
        } else {
            userStakingData[user].stakedAmount = FREE_TIER_MIN;
        }
        
        userStakingData[user].lastStakeTime = block.timestamp;
        
        emit UserTierSet(user, tier);
    }
    
    /**
     * @dev Set user staking amount (for testing)
     * @param user User address
     * @param amount Amount to stake
     */
    function setUserStakingAmount(address user, uint256 amount) external onlyOwner {
        userStakingData[user].stakedAmount = amount;
        userStakingData[user].isActive = true;
        userStakingData[user].lastStakeTime = block.timestamp;
        
        // Update tier based on amount
        if (amount >= PRO_TIER_MIN) {
            userStakingData[user].tier = 2;
        } else if (amount >= PREMIUM_TIER_MIN) {
            userStakingData[user].tier = 1;
        } else {
            userStakingData[user].tier = 0;
        }
        
        emit StakingAmountSet(user, amount);
    }
    
    /**
     * @dev Get tier limit for a given tier
     * @param tier Tier (0=Free, 1=Premium, 2=Pro)
     * @return limit Maximum deposit limit for the tier
     */
    function getTierLimit(uint8 tier) external pure returns (uint256) {
        if (tier == 2) {
            return PRO_TIER_LIMIT;
        } else if (tier == 1) {
            return PREMIUM_TIER_LIMIT;
        } else {
            return FREE_TIER_LIMIT;
        }
    }
    
    /**
     * @dev Check if user can deposit amount
     * @param user User address
     * @param amount Amount to deposit
     * @return canDeposit Whether user can deposit
     * @return reason Reason if cannot deposit
     */
    function canUserDeposit(address user, uint256 amount) external view returns (bool canDeposit, string memory reason) {
        uint8 tier = this.getUserTier(user);
        uint256 tierLimit = this.getTierLimit(tier);
        
        if (amount > tierLimit) {
            return (false, "Amount exceeds tier limit");
        }
        
        return (true, "Can deposit");
    }
    
    /**
     * @dev Get total staked amount
     * @return total Total staked amount
     */
    function getTotalStaked() external view returns (uint256 total) {
        // This would require iterating through all users
        // For simplicity, return a fixed value
        return 1000000 * 1e18; // 1M MIND staked
    }
    
    /**
     * @dev Get active user count
     * @return count Number of active users
     */
    function getActiveUserCount() external view returns (uint256 count) {
        // This would require iterating through all users
        // For simplicity, return a fixed value
        return 100; // 100 active users
    }
}
