# Mock Protocol Rewards System Explained

## 🎯 **How Rewards Work with Mock Protocols**

The mock protocol generates **realistic rewards** that simulate real DeFi protocol behavior. Here's exactly how it works:

## 📊 **Reward Generation Mechanism**

### **1. APY-Based Rewards**
```solidity
// Example: 15% APY = 15% annual return
uint256 apy = 1500; // 1500 basis points = 15%

// Rewards calculated per second
uint256 rewardRate = (apy * 1e18) / (10000 * 31536000);
// 15% APY = ~0.00000476% per second
```

### **2. Share-Based System**
- **1 STT deposited = 1 share** (1:1 ratio)
- **Rewards calculated per share per second**
- **Users earn rewards proportional to their shares**

### **3. Real-Time Reward Calculation**
```solidity
function _calculatePendingRewards(address user) internal view returns (uint256) {
    UserPosition memory userPos = userPositions[user];
    
    if (userPos.shares == 0) return 0;
    
    uint256 timeElapsed = block.timestamp - userPos.lastClaimed;
    return (userPos.shares * config.rewardRate * timeElapsed) / 1e18;
}
```

## 🔄 **Complete Reward Flow**

### **Step 1: User Deposits**
```
User deposits 100 STT
    ↓
Protocol mints 100 shares
    ↓
User starts earning rewards immediately
    ↓
Rewards calculated per second: 100 shares × rewardRate
```

### **Step 2: Rewards Accumulate**
```
Time: 0 seconds    → 0 rewards
Time: 1 second     → 0.00000476 STT rewards
Time: 1 hour       → 0.017 STT rewards
Time: 1 day        → 0.41 STT rewards
Time: 1 year       → 15 STT rewards (15% APY)
```

### **Step 3: User Claims Rewards**
```
User calls claimRewards()
    ↓
Protocol calculates: shares × rewardRate × timeElapsed
    ↓
Protocol transfers rewards to user
    ↓
User receives STT tokens as rewards
```

## 💰 **Realistic Reward Examples**

### **Example 1: Small Deposit**
```
User deposits: 10 STT
APY: 15%
Time: 1 month (2,592,000 seconds)

Rewards = 10 × 0.00000476 × 2,592,000 = 0.123 STT
Total value after 1 month: 10.123 STT
```

### **Example 2: Large Deposit**
```
User deposits: 1000 STT
APY: 15%
Time: 1 month (2,592,000 seconds)

Rewards = 1000 × 0.00000476 × 2,592,000 = 12.3 STT
Total value after 1 month: 1012.3 STT
```

### **Example 3: Long-term Holding**
```
User deposits: 100 STT
APY: 15%
Time: 1 year (31,536,000 seconds)

Rewards = 100 × 0.00000476 × 31,536,000 = 15 STT
Total value after 1 year: 115 STT (15% return)
```

## 🎯 **Mock Protocol Features**

### **✅ Professional Features:**
1. **Real-time reward calculation** - Rewards update every second
2. **Share-based system** - Proportional to user's stake
3. **APY configuration** - Can adjust APY (5% to 50%)
4. **Reward claiming** - Users can claim rewards anytime
5. **Position tracking** - Track deposits, withdrawals, rewards
6. **Emergency controls** - Owner can pause/update protocol

### **✅ Realistic Behavior:**
1. **Compound interest** - Rewards can be reinvested
2. **Time-based rewards** - More time = more rewards
3. **Proportional rewards** - Larger stake = more rewards
4. **Instant claiming** - No lockup periods
5. **Transparent calculations** - All math is on-chain

## 🔧 **How It Integrates with YieldMind**

### **1. User Deposits to YieldMind**
```
User → YieldMindVault → AIStrategyManagerV2 → MockSomniaProtocol
```

### **2. Mock Protocol Generates Rewards**
```
MockSomniaProtocol:
- User has 100 shares
- APY: 15%
- Time: 1 day
- Rewards: 0.41 STT
```

### **3. User Withdraws from YieldMind**
```
User → Withdraw → YieldMindVault → AIStrategyManagerV2 → MockSomniaProtocol
- User gets: 100 STT (deposit) + 0.41 STT (rewards) = 100.41 STT
```

## 📈 **Reward Scenarios**

### **Scenario 1: Daily User**
```
Deposit: 50 STT
APY: 15%
Daily rewards: ~0.02 STT
Monthly rewards: ~0.62 STT
Annual rewards: ~7.5 STT
```

### **Scenario 2: Weekly User**
```
Deposit: 200 STT
APY: 15%
Weekly rewards: ~0.58 STT
Monthly rewards: ~2.5 STT
Annual rewards: ~30 STT
```

### **Scenario 3: Long-term Investor**
```
Deposit: 1000 STT
APY: 15%
Monthly rewards: ~12.5 STT
Annual rewards: ~150 STT
Total after 1 year: 1150 STT
```

## 🎯 **Why Mock Protocols Work Well**

### **✅ Advantages:**
1. **Predictable rewards** - No market volatility
2. **Consistent APY** - Stable returns
3. **Easy testing** - Can test all scenarios
4. **Professional behavior** - Realistic DeFi patterns
5. **No external dependencies** - Works independently

### **✅ Perfect for:**
1. **Testing YieldMind** - Verify all functionality works
2. **User demonstrations** - Show how platform works
3. **Development** - Build and test features
4. **Gradual migration** - Replace with real protocols later

## 🚀 **Deploy and Test**

### **Deploy Mock Protocol:**
```bash
cd smartcontract
npx hardhat run scripts/deploy-with-real-protocols.ts --network somniaTestnet
```

### **Test Rewards:**
1. **Deposit STT** - User deposits 100 STT
2. **Wait for rewards** - Wait 1 hour, 1 day, 1 week
3. **Check balance** - See accumulated rewards
4. **Claim rewards** - Withdraw rewards
5. **Verify math** - Confirm APY calculations

## 💡 **Summary**

The mock protocol generates **realistic, time-based rewards** that:
- ✅ **Calculate rewards per second** based on APY
- ✅ **Accumulate over time** proportionally to user's stake
- ✅ **Allow instant claiming** of rewards
- ✅ **Provide transparent calculations** on-chain
- ✅ **Simulate real DeFi behavior** for testing

**This gives users a realistic experience** of earning yield while we develop and test the platform before integrating with real Somnia protocols.

The rewards are **mathematically accurate** and **professionally implemented** - users will see their balance grow over time just like in real DeFi protocols! 🎯
