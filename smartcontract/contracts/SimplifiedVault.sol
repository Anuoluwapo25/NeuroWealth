// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IMINDStaking {
    function getUserTier(address user) external view returns (uint8);
}

interface IMockSomniaProtocol {
    function deposit() external payable;
    function withdraw(uint256 shares) external;
    function getBalance(address user) external view returns (uint256);
    function getPendingRewards(address user) external view returns (uint256);
    function claimRewards() external;
}

contract SimplifiedVault is ReentrancyGuard, Ownable, Pausable {
    
    // Events
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    // Structs
    struct UserPosition {
        uint256 principal;           // Original STT deposit amount
        uint256 currentValue;        // Current position value (principal + rewards)
        uint256 lastUpdateTime;      // Last update timestamp
        uint256 totalReturns;        // Lifetime returns
    }
    
    // State variables
    mapping(address => UserPosition) public userPositions;
    mapping(uint8 => uint256) public tierLimits; // Tier => max deposit limit
    
    // STT-specific limits
    uint256 public constant MIN_DEPOSIT = 0.1 ether; // 0.1 STT minimum
    uint256 public constant MAX_DEPOSIT = 1000 ether; // 1000 STT maximum
    
    IMINDStaking public mindStaking;
    IMockSomniaProtocol public mockProtocol;
    
    uint256 public totalValueLocked;
    uint256 public totalFeesCollected;
    
    // Tier-based rebalancing frequencies (in seconds)
    mapping(uint8 => uint256) public rebalanceFrequency;
    
    constructor(
        address _mindStaking,
        address _mockProtocol
    ) Ownable(msg.sender) {
        mindStaking = IMINDStaking(_mindStaking);
        mockProtocol = IMockSomniaProtocol(_mockProtocol);
        
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
     * @dev Deposit STT into the simplified vault
     */
    function deposit() external payable nonReentrant whenNotPaused {
        require(msg.value >= MIN_DEPOSIT, "Below minimum deposit");
        require(msg.value <= MAX_DEPOSIT, "Exceeds maximum deposit");
        
        uint8 userTier = mindStaking.getUserTier(msg.sender);
        
        // Check tier limits
        UserPosition storage position = userPositions[msg.sender];
        uint256 newTotal = position.principal + msg.value;
        require(newTotal <= tierLimits[userTier], "Exceeds tier limit");
        
        // Update user position
        position.principal += msg.value;
        position.currentValue += msg.value;
        position.lastUpdateTime = block.timestamp;
        
        // Update total value locked
        totalValueLocked += msg.value;
        
        // Deposit directly to mock protocol
        mockProtocol.deposit{value: msg.value}();
        
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw STT from the simplified vault
     */
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
        
        // Withdraw from mock protocol
        mockProtocol.withdraw(amount);
        
        // Transfer to user
        payable(msg.sender).transfer(amount);
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev Get user's current position value including rewards
     */
    function getUserPositionValue(address user) external view returns (uint256) {
        UserPosition memory position = userPositions[user];
        if (position.principal == 0) return 0;
        
        // Get current balance from mock protocol
        uint256 protocolBalance = mockProtocol.getBalance(address(this));
        uint256 pendingRewards = mockProtocol.getPendingRewards(address(this));
        
        return position.principal + pendingRewards;
    }
    
    /**
     * @dev Claim rewards for a user
     */
    function claimRewards() external nonReentrant {
        UserPosition storage position = userPositions[msg.sender];
        require(position.principal > 0, "No position to claim rewards for");
        
        // Claim rewards from mock protocol
        mockProtocol.claimRewards();
        
        // Get pending rewards
        uint256 pendingRewards = mockProtocol.getPendingRewards(address(this));
        
        if (pendingRewards > 0) {
            // Update user position
            position.currentValue += pendingRewards;
            position.totalReturns += pendingRewards;
            position.lastUpdateTime = block.timestamp;
            
            // Transfer rewards to user
            payable(msg.sender).transfer(pendingRewards);
            
            emit RewardsClaimed(msg.sender, pendingRewards);
        }
    }
    
    /**
     * @dev Get user's pending rewards
     */
    function getPendingRewards(address user) external view returns (uint256) {
        UserPosition memory position = userPositions[user];
        if (position.principal == 0) return 0;
        
        return mockProtocol.getPendingRewards(address(this));
    }
    
    /**
     * @dev Get total value locked in the vault
     */
    function getTotalValueLocked() external view returns (uint256) {
        return totalValueLocked;
    }
    
    /**
     * @dev Get vault's balance in mock protocol
     */
    function getProtocolBalance() external view returns (uint256) {
        return mockProtocol.getBalance(address(this));
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Update tier limits (only owner)
     */
    function updateTierLimit(uint8 tier, uint256 newLimit) external onlyOwner {
        require(tier <= 2, "Invalid tier");
        tierLimits[tier] = newLimit;
    }
    
    /**
     * @dev Update mock protocol address (only owner)
     */
    function updateMockProtocol(address newProtocol) external onlyOwner {
        require(newProtocol != address(0), "Invalid protocol address");
        mockProtocol = IMockSomniaProtocol(newProtocol);
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {
        // Allow direct ETH transfers
    }
}
