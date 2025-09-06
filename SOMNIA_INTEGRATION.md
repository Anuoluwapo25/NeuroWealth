# YieldMind Somnia Integration Guide

## 🪙 Supported Tokens on Somnia

### Primary Deposit Tokens

#### 1. **SOMI (Native Token)**
- **Purpose**: Somnia's native token for gas, staking, and governance
- **Minimum Deposit**: 10 SOMI
- **Maximum Deposit**: 1,000,000 SOMI
- **Decimals**: 18
- **Use Case**: Users can stake SOMI to earn rewards and participate in governance

#### 2. **USDC (USD Coin)**
- **Purpose**: Most popular stablecoin for DeFi
- **Minimum Deposit**: $100 USDC
- **Maximum Deposit**: $10,000,000 USDC
- **Decimals**: 6
- **Use Case**: Stable value for yield farming strategies

#### 3. **USDT (Tether USD)**
- **Purpose**: Second most popular stablecoin
- **Minimum Deposit**: $100 USDT
- **Maximum Deposit**: $10,000,000 USDT
- **Decimals**: 6
- **Use Case**: Alternative stablecoin option

#### 4. **DAI (Dai Stablecoin)**
- **Purpose**: Decentralized stablecoin
- **Minimum Deposit**: 100 DAI
- **Maximum Deposit**: 10,000,000 DAI
- **Decimals**: 18
- **Use Case**: Decentralized stablecoin option

## 🚀 Deployment Steps

### 1. Deploy Contracts to Somnia
```bash
# Deploy to Somnia Testnet
npm run deploy:testnet

# Deploy to Somnia Mainnet
npm run deploy:mainnet
```

### 2. Setup Supported Tokens
```bash
# Configure supported tokens
npm run setup:tokens
```

### 3. Verify Contracts
```bash
# Verify on Somnia Testnet
npm run verify:testnet

# Verify on Somnia Mainnet
npm run verify:mainnet
```

## 🔧 Configuration

### Environment Variables
```bash
# Somnia Network Configuration
SOMNIA_RPC_URL=https://rpc.somnia.network
SOMNIA_TESTNET_RPC_URL=https://testnet-rpc.somnia.network
SOMNIA_API_KEY=your_somnia_api_key_here

# Contract Addresses (set after deployment)
YIELD_MIND_VAULT_ADDRESS=0x...
AI_STRATEGY_MANAGER_ADDRESS=0x...
MIND_STAKING_ADDRESS=0x...
MIND_TOKEN_ADDRESS=0x...
```

### Token Addresses on Somnia
You'll need to replace the placeholder addresses in `setup-somnia-tokens.ts` with actual token addresses:

```typescript
const somniaTokens = {
  SOMI: "0x...", // Actual SOMI token address
  USDC: "0x...", // Actual USDC address on Somnia
  USDT: "0x...", // Actual USDT address on Somnia
  DAI: "0x...",  // Actual DAI address on Somnia
};
```

## 💡 Token Strategy

### Why These Tokens?

1. **SOMI**: Native token ensures deep integration with Somnia ecosystem
2. **USDC/USDT**: Most liquid stablecoins for DeFi strategies
3. **DAI**: Decentralized alternative for users who prefer non-custodial options

### Yield Optimization Strategy

The AI will optimize across these tokens by:
- **SOMI**: Staking rewards, governance participation, native DeFi protocols
- **Stablecoins**: Cross-protocol yield farming, lending, liquidity provision

## 🔄 User Flow

### Deposit Process
1. User connects wallet to Somnia network
2. Selects supported token (SOMI, USDC, USDT, or DAI)
3. Deposits amount within min/max limits
4. AI automatically optimizes across available Somnia DeFi protocols
5. User earns optimized yields

### Withdrawal Process
1. User requests withdrawal
2. AI calculates current portfolio value
3. Performance fee (0.5%) deducted from profits only
4. Remaining funds returned to user

## 📊 Expected Performance

### Somnia Advantages
- **Sub-second finality**: Instant rebalancing
- **Low fees**: More profit for users
- **High throughput**: Handle many simultaneous users
- **EVM compatibility**: Existing DeFi protocols work

### Yield Opportunities
- Native Somnia staking rewards
- Cross-protocol arbitrage
- Liquidity provision rewards
- Governance participation rewards

## 🛠️ Development Notes

### Smart Contract Updates
- All existing contracts work without modification
- Token support configured via `addSupportedToken()` function
- AI strategy manager adapts to Somnia's protocol ecosystem

### Frontend Updates
- Wallet connection supports Somnia network
- Token selection UI shows supported tokens
- Network switching between Somnia and other chains

## 🚨 Important Considerations

### Token Availability
- Verify tokens are actually available on Somnia before deployment
- Check if tokens need to be bridged from other networks
- Ensure sufficient liquidity for large deposits

### Protocol Integration
- Identify Somnia-native DeFi protocols for yield strategies
- Update AI strategy manager with Somnia protocol addresses
- Test all integrations on testnet first

### Security
- Audit token contracts before adding to supported list
- Implement proper access controls for token management
- Monitor for any Somnia-specific security considerations

## 📈 Next Steps

1. **Research Somnia DeFi Ecosystem**: Find available protocols for yield strategies
2. **Deploy on Testnet**: Test all functionality with test tokens
3. **Get Real Token Addresses**: Replace placeholders with actual addresses
4. **Frontend Integration**: Update UI for Somnia network
5. **Mainnet Deployment**: Deploy to Somnia mainnet when ready
6. **Marketing**: Promote Somnia-specific benefits to users

This integration positions YieldMind as a leading DeFi optimization platform on Somnia, leveraging the network's superior performance for better user experience and higher yields.
