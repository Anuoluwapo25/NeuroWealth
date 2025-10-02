// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockAerodromeStrategyAdapter {
    address public aiStrategyManager;
    mapping(address => uint256) public userBalances;

    constructor(address _aiStrategyManager) {
        aiStrategyManager = _aiStrategyManager;
    }

    // Add this function - required by IExternalProtocol interface
    function deposit(address token, uint256 amount) external returns (uint256) {
        // Mock implementation
        return amount;
    }

    function depositUSDC(uint256 amount, address user) external {
        userBalances[user] += amount;
    }

    function withdrawUserPosition(address user, uint256 percentage) external {
        uint256 currentBalance = userBalances[user];
        uint256 withdrawAmount = (currentBalance * percentage) / 100;
        userBalances[user] -= withdrawAmount;
    }

    function getUserBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }

    function getEstimatedAPY() external pure returns (uint256) {
        return 800; // 8% APY
    }
}