// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockMINDStaking
 * @dev Mock contract for testing tier-based functionality
 */
contract MockMINDStaking {
    mapping(address => uint8) private userTiers;

    /**
     * @dev Set a user's tier (for testing)
     */
    function setUserTier(address user, uint8 tier) external {
        require(tier <= 2, "Invalid tier");
        userTiers[user] = tier;
    }

    /**
     * @dev Get a user's tier
     * @return tier 0 = Free, 1 = Premium, 2 = Pro
     */
    function getUserTier(address user) external view returns (uint8) {
        return userTiers[user];
    }
}