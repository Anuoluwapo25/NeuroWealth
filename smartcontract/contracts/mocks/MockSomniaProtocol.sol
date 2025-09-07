// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MockSomniaProtocol
 * @dev Professional mock protocol that simulates real DeFi protocol behavior
 * This generates realistic rewards and yield for testing YieldMind
 */
contract MockSomniaProtocol is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Events
    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event RewardsClaimed(address indexed user, uint256 amount);
    event APYUpdated(uint256 newAPY);
    
    // Protocol configuration
    struct ProtocolConfig {
        uint256 apy;                    // APY in basis points (100 = 1%)
        uint256 totalDeposits;          // Total deposits in the protocol
        uint256 totalShares;            // Total shares minted
        uint256 lastUpdate;             // Last reward calculation timestamp
        uint256 rewardRate;             // Rewards per second per share
        bool isActive;                  // Whether protocol is active
    }
    
    // User position
    struct UserPosition {
        uint256 shares;                 // User's shares in the protocol
        uint256 lastClaimed;            // Last time user claimed rewards
        uint256 pendingRewards;         // Pending rewards to claim
        uint256 totalDeposited;         // Total amount user deposited
        uint256 totalWithdrawn;         // Total amount user withdrawn
    }
    
    ProtocolConfig public config;
    mapping(address => UserPosition) public userPositions;
    
    // Native token support
    bool public supportsNativeToken;
    
    // ERC20 token support
    IERC20 public depositToken;
    
    // Reward calculation constants
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 31,536,000 seconds
    uint256 public constant BASIS_POINTS = 10000; // 100% = 10000 basis points
    
    constructor(
        address _depositToken,
        bool _supportsNativeToken,
        uint256 _initialAPY
    ) Ownable(msg.sender) {
        depositToken = IERC20(_depositToken);
        supportsNativeToken = _supportsNativeToken;
        
        config = ProtocolConfig({
            apy: _initialAPY,
            totalDeposits: 0,
            totalShares: 0,
            lastUpdate: block.timestamp,
            rewardRate: 0,
            isActive: true
        });
        
        _updateRewardRate();
    }
    
    /**
     * @dev Deposit native tokens (STT) into the protocol
     */
    function deposit() external payable nonReentrant {
        require(supportsNativeToken, "Protocol does not support native tokens");
        require(msg.value > 0, "Amount must be greater than 0");
        require(config.isActive, "Protocol is not active");
        
        _updateUserRewards(msg.sender);
        
        // Calculate shares (1:1 ratio for simplicity)
        uint256 shares = msg.value;
        
        // Update user position
        UserPosition storage user = userPositions[msg.sender];
        user.shares += shares;
        user.totalDeposited += msg.value;
        
        // Update protocol totals
        config.totalDeposits += msg.value;
        config.totalShares += shares;
        
        emit Deposited(msg.sender, msg.value, shares);
    }
    
    /**
     * @dev Deposit ERC20 tokens into the protocol
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(config.isActive, "Protocol is not active");
        
        _updateUserRewards(msg.sender);
        
        // Transfer tokens from user
        depositToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Calculate shares (1:1 ratio for simplicity)
        uint256 shares = amount;
        
        // Update user position
        UserPosition storage user = userPositions[msg.sender];
        user.shares += shares;
        user.totalDeposited += amount;
        
        // Update protocol totals
        config.totalDeposits += amount;
        config.totalShares += shares;
        
        emit Deposited(msg.sender, amount, shares);
    }
    
    /**
     * @dev Withdraw from the protocol
     */
    function withdraw(uint256 shares) external nonReentrant {
        require(shares > 0, "Shares must be greater than 0");
        
        UserPosition storage user = userPositions[msg.sender];
        require(user.shares >= shares, "Insufficient shares");
        
        _updateUserRewards(msg.sender);
        
        // Calculate withdrawal amount (1:1 ratio for simplicity)
        uint256 amount = shares;
        
        // Update user position
        user.shares -= shares;
        user.totalWithdrawn += amount;
        
        // Update protocol totals
        config.totalDeposits -= amount;
        config.totalShares -= shares;
        
        // Transfer tokens to user
        if (supportsNativeToken) {
            payable(msg.sender).transfer(amount);
        } else {
            depositToken.safeTransfer(msg.sender, amount);
        }
        
        emit Withdrawn(msg.sender, amount, shares);
    }
    
    /**
     * @dev Claim pending rewards
     */
    function claimRewards() external nonReentrant {
        _updateUserRewards(msg.sender);
        
        UserPosition storage user = userPositions[msg.sender];
        uint256 rewards = user.pendingRewards;
        
        require(rewards > 0, "No rewards to claim");
        
        user.pendingRewards = 0;
        user.lastClaimed = block.timestamp;
        
        // Transfer rewards to user
        if (supportsNativeToken) {
            payable(msg.sender).transfer(rewards);
        } else {
            depositToken.safeTransfer(msg.sender, rewards);
        }
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    /**
     * @dev Get user's current balance (deposits + rewards)
     */
    function getBalance(address user) external view returns (uint256) {
        UserPosition memory userPos = userPositions[user];
        uint256 pendingRewards = _calculatePendingRewards(user);
        return userPos.shares + pendingRewards;
    }
    
    /**
     * @dev Get user's pending rewards
     */
    function getPendingRewards(address user) external view returns (uint256) {
        return _calculatePendingRewards(user);
    }
    
    /**
     * @dev Get current APY
     */
    function getAPY() external view returns (uint256) {
        return config.apy;
    }
    
    /**
     * @dev Get total value locked
     */
    function getTVL() external view returns (uint256) {
        return config.totalDeposits;
    }
    
    /**
     * @dev Update APY (only owner)
     */
    function updateAPY(uint256 newAPY) external onlyOwner {
        require(newAPY <= 5000, "APY cannot exceed 50%"); // Max 50% APY
        
        _updateAllUserRewards();
        config.apy = newAPY;
        _updateRewardRate();
        
        emit APYUpdated(newAPY);
    }
    
    /**
     * @dev Set protocol active status (only owner)
     */
    function setActive(bool _isActive) external onlyOwner {
        config.isActive = _isActive;
    }
    
    /**
     * @dev Update user rewards
     */
    function _updateUserRewards(address user) internal {
        UserPosition storage userPos = userPositions[user];
        
        if (userPos.shares > 0) {
            uint256 pendingRewards = _calculatePendingRewards(user);
            userPos.pendingRewards += pendingRewards;
        }
        
        userPos.lastClaimed = block.timestamp;
    }
    
    /**
     * @dev Calculate pending rewards for a user
     */
    function _calculatePendingRewards(address user) internal view returns (uint256) {
        UserPosition memory userPos = userPositions[user];
        
        if (userPos.shares == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - userPos.lastClaimed;
        return (userPos.shares * config.rewardRate * timeElapsed) / 1e18;
    }
    
    /**
     * @dev Update reward rate based on current APY
     */
    function _updateRewardRate() internal {
        if (config.totalShares == 0) {
            config.rewardRate = 0;
        } else {
            // Calculate reward rate per second
            // APY in basis points -> rate per second
            config.rewardRate = (config.apy * 1e18) / (BASIS_POINTS * SECONDS_PER_YEAR);
        }
    }
    
    /**
     * @dev Update all user rewards (called when APY changes)
     */
    function _updateAllUserRewards() internal {
        // This would require iterating through all users
        // For simplicity, we'll just update the global state
        config.lastUpdate = block.timestamp;
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        if (supportsNativeToken) {
            payable(owner()).transfer(address(this).balance);
        } else {
            depositToken.safeTransfer(owner(), depositToken.balanceOf(address(this)));
        }
    }
    
    /**
     * @dev Get protocol information
     */
    function getProtocolInfo() external view returns (
        uint256 apy,
        uint256 totalDeposits,
        uint256 totalShares,
        uint256 rewardRate,
        bool isActive
    ) {
        return (
            config.apy,
            config.totalDeposits,
            config.totalShares,
            config.rewardRate,
            config.isActive
        );
    }
    
    /**
     * @dev Get user position details
     */
    function getUserPosition(address user) external view returns (
        uint256 shares,
        uint256 pendingRewards,
        uint256 totalDeposited,
        uint256 totalWithdrawn
    ) {
        UserPosition memory userPos = userPositions[user];
        return (
            userPos.shares,
            _calculatePendingRewards(user),
            userPos.totalDeposited,
            userPos.totalWithdrawn
        );
    }
}
