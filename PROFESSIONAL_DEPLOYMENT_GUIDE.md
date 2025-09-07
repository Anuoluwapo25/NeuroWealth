# Professional YieldMind Deployment Guide

## Overview

This guide will help you deploy a professional-grade YieldMind setup with proper DeFi protocol integration, native STT token support, and AI-driven strategy management.

## Prerequisites

1. **Node.js and npm** installed
2. **Hardhat** configured for Somnia testnet
3. **MetaMask** connected to Somnia testnet
4. **STT test tokens** for deployment and testing

## Step 1: Deploy Professional Contracts

### 1.1 Deploy MockSomniaProtocol and AIStrategyManagerV2

```bash
cd smartcontract
npx hardhat run scripts/deploy-professional-setup.ts --network somniaTestnet
```

This will deploy:
- **MockSomniaProtocol**: A professional mock protocol that supports both native STT and ERC20 tokens
- **AIStrategyManagerV2**: Enhanced strategy manager with native token support
- **Protocol Integration**: Sets up 3 different yield protocols with varying APYs and risk levels

### 1.2 Update Contract Addresses

After deployment, update the frontend contract addresses:

```typescript
// In frontend/abi/index.ts
export const AiStrategyManagerV2Contract = {
  abi: AI_STRATEGY_MANAGER_ABI,
  address: 'DEPLOYED_ADDRESS_HERE', // Update with actual address
};

export const MockSomniaProtocolContract = {
  abi: MOCK_PROTOCOL_ABI, // Add the ABI
  address: 'DEPLOYED_ADDRESS_HERE', // Update with actual address
};
```

## Step 2: Professional Features

### 2.1 Native STT Token Support

The new setup properly handles native STT tokens:

- **YieldMindVault**: Accepts native STT deposits
- **AIStrategyManagerV2**: Routes native STT to appropriate protocols
- **MockSomniaProtocol**: Generates yield on native STT deposits

### 2.2 Multi-Protocol Yield Farming

Three integrated protocols:

1. **Somnia Lending Protocol** (Native STT)
   - APY: 12%
   - Risk: Low (20/100)
   - Supports native STT tokens

2. **Somnia DEX Protocol** (ERC20)
   - APY: 18%
   - Risk: Medium (40/100)
   - Supports ERC20 tokens

3. **Somnia Yield Farm Protocol** (ERC20)
   - APY: 25%
   - Risk: High (60/100)
   - Supports ERC20 tokens

### 2.3 AI-Driven Strategy Optimization

The AIStrategyManagerV2 includes:

- **Risk-Adjusted Allocation**: Distributes funds based on risk scores
- **Dynamic Rebalancing**: Adjusts portfolio based on performance
- **Protocol Selection**: Chooses optimal protocols for each deposit
- **Yield Optimization**: Maximizes returns while managing risk

## Step 3: Testing the Professional Setup

### 3.1 Test Native STT Deposits

1. Navigate to `/deposit-ethers`
2. Connect your wallet
3. Check the "Contract State" section - should show:
   - Contract Status: Active
   - Strategy Status: Working
   - Protocols: 3 configured

4. Deposit STT tokens (minimum 0.1 STT)
5. Monitor the transaction on Somnia Explorer

### 3.2 Verify Protocol Integration

After a successful deposit:

1. Check the MockSomniaProtocol contract on Somnia Explorer
2. Verify the deposit was routed to the appropriate protocol
3. Confirm yield generation is active

### 3.3 Test Portfolio Management

1. Check user position in the vault
2. Verify AI strategy allocation
3. Monitor yield generation over time

## Step 4: Production Considerations

### 4.1 Real Protocol Integration

Replace MockSomniaProtocol with real Somnia DeFi protocols:

```solidity
// Example: Integrate with real Somnia lending protocol
contract RealSomniaLending {
    function deposit() external payable returns (uint256 shares);
    function withdraw(uint256 shares) external returns (uint256);
    function getBalance(address user) external view returns (uint256);
}
```

### 4.2 Oracle Integration

Implement real-time APY and risk data:

```solidity
contract DataOracle {
    function updateProtocolData(
        address protocol,
        uint256 newAPY,
        uint256 newRiskScore,
        uint256 newTVL
    ) external;
}
```

### 4.3 Security Audits

Before mainnet deployment:

1. **Smart Contract Audit**: Professional security audit
2. **Penetration Testing**: Test for vulnerabilities
3. **Code Review**: Comprehensive code review
4. **Bug Bounty**: Community bug bounty program

## Step 5: Monitoring and Maintenance

### 5.1 Performance Monitoring

- Track APY across protocols
- Monitor risk-adjusted returns
- Analyze user deposit patterns
- Optimize AI strategy parameters

### 5.2 Protocol Updates

- Add new DeFi protocols
- Update APY calculations
- Adjust risk scores
- Implement new yield strategies

### 5.3 User Experience

- Improve deposit/withdrawal flows
- Add portfolio visualization
- Implement yield tracking
- Create user dashboards

## Troubleshooting

### Common Issues

1. **"Strategy execution failed"**
   - Check if protocols are properly configured
   - Verify native token support
   - Ensure sufficient contract balance

2. **"Contract not active"**
   - Check protocol activation status
   - Verify deployment was successful
   - Update contract addresses

3. **"Insufficient balance"**
   - Ensure user has enough STT tokens
   - Check minimum deposit requirements
   - Verify gas estimation

### Debug Commands

```bash
# Check contract deployment
npx hardhat verify --network somniaTestnet CONTRACT_ADDRESS

# Test contract interaction
npx hardhat run scripts/test-contracts.ts --network somniaTestnet

# Check protocol status
npx hardhat run scripts/check-protocols.ts --network somniaTestnet
```

## Success Metrics

After professional deployment, you should see:

- ✅ **Native STT deposits working**
- ✅ **Multi-protocol yield generation**
- ✅ **AI-driven strategy optimization**
- ✅ **Professional DeFi integration**
- ✅ **Risk-adjusted portfolio management**
- ✅ **Real-time yield tracking**

## Next Steps

1. **Deploy the professional setup**
2. **Test all functionality**
3. **Integrate real Somnia protocols**
4. **Implement oracle data feeds**
5. **Conduct security audits**
6. **Launch on mainnet**

This professional setup transforms YieldMind from a simple vault into a sophisticated DeFi platform with AI-driven yield optimization and multi-protocol integration.
