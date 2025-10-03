// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockSimpleVault is Ownable {
    mapping(address => bool) public supportedTokens;
    mapping(address => mapping(address => uint256)) public userBalances;

    uint256 public constant MINIMUM_DEPOSIT = 100 * 1e18;

    // Tier limits
    uint256 public constant FREE_TIER_LIMIT = 10000 * 1e18; // $10k
    uint256 public constant PREMIUM_TIER_LIMIT = 100000 * 1e18; // $100k
    uint256 public constant PRO_TIER_LIMIT = 1000000 * 1e18; // $1M

    constructor() Ownable(msg.sender) {}

    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function deposit(address token, uint256 amount) external {
        require(supportedTokens[token], "Token not supported");
        require(amount >= MINIMUM_DEPOSIT, "Below minimum deposit");

        // Mock tier check (assume user is free tier for simplicity)
        require(
            userBalances[msg.sender][token] + amount <= FREE_TIER_LIMIT,
            "Exceeds tier limit"
        );

        IERC20(token).transferFrom(msg.sender, address(this), amount);
        userBalances[msg.sender][token] += amount;
    }

    function getUserBalance(
        address user,
        address token
    ) external view returns (uint256) {
        return userBalances[user][token];
    }

    function withdraw(address token, uint256 amount) external {
        require(
            userBalances[msg.sender][token] >= amount,
            "Insufficient balance"
        );

        userBalances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
    }

    function getTotalDeposits(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
