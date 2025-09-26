# NeuroWealth Contract ABIs

This folder contains all the smart contract ABIs (Application Binary Interfaces) for the NeuroWealth protocol.

## Structure

```
abi/
├── index.ts              # Main export file with contract configurations
├── mind.ts               # MIND Token ABI
├── mind-staking.ts       # MIND Staking ABI
├── neuro-wealth-vault.ts   # NeuroWealth Vault ABI
├── ai-strategy-manager.ts # AI Strategy Manager ABI
├── fee-manager.ts        # Fee Manager ABI
└── README.md             # This file
```

## Contract Addresses

| Contract | Address | Status |
|----------|---------|--------|
| MIND Token | `0x9b39Fb4c93d80dF3E91a0369c5B6599Cf80873A4` | ✅ Deployed |
| MIND Staking | `0xA4Dc2B96Eef1D5189260eb4a7e53C482C439d1b4` | ✅ Deployed |
| AI Strategy Manager | `0xbe00F9a79aC39CD3FC8802bA1BF94Eae98C9d3f5` | ✅ Deployed |
| NeuroWealth Vault | `0xD2D2cE855a37FB1FbbF131D869f3c17847B952F9` | ✅ Deployed |
| Fee Manager | `0x0000000000000000000000000000000000000000` | ⏳ Not Deployed |

## Usage

### Basic Import

```typescript
import { MindContract, MindStakingContract } from '@/abi';
```

### Using with ethers.js

```typescript
import { ethers } from 'ethers';
import { MindContract } from '@/abi';

// Create contract instance
const provider = new ethers.JsonRpcProvider('YOUR_RPC_URL');
const mindToken = new ethers.Contract(MindContract.address, MindContract.abi, provider);

// Call contract functions
const balance = await mindToken.balanceOf('0x...');
const totalSupply = await mindToken.totalSupply();
```

### Using with Wagmi

```typescript
import { useContractRead } from 'wagmi';
import { MindContract } from '@/abi';

function MyComponent() {
  const { data: balance } = useContractRead({
    address: MindContract.address as `0x${string}`,
    abi: MindContract.abi,
    functionName: 'balanceOf',
    args: ['0x...'],
  });

  return <div>Balance: {balance?.toString()}</div>;
}
```

### Using Utility Functions

```typescript
import { getMindTokenBalance, getStakingInfo } from '@/lib/contract-utils';

// Get MIND token balance
const balance = await getMindTokenBalance('0x...', provider);

// Get staking information
const stakingInfo = await getStakingInfo('0x...', provider);
```

## Contract Functions

### MIND Token
- `balanceOf(address)` - Get token balance
- `transfer(to, amount)` - Transfer tokens
- `approve(spender, amount)` - Approve spending
- `mint(to, amount)` - Mint new tokens (minter only)
- `burn(amount)` - Burn tokens

### MIND Staking
- `stake(amount)` - Stake MIND tokens
- `unstake(amount)` - Unstake tokens
- `claimRewards()` - Claim staking rewards
- `getUserStakeInfo(address)` - Get user staking info

### NeuroWealth Vault
- `deposit(token, amount)` - Deposit tokens
- `withdraw(amount)` - Withdraw from vault
- `getUserPosition(address)` - Get user position
- `totalValueLocked()` - Get total value locked

### AI Strategy Manager
- `executeStrategy(amount, token)` - Execute AI strategy
- `rebalancePortfolio(user)` - Rebalance user portfolio
- `getUserStrategy(address)` - Get user strategy info

### Fee Manager
- `collectFees(token, amount)` - Collect performance fees
- `distributeFees(token)` - Distribute collected fees
- `getCollectedFees(token)` - Get collected fees amount

## Environment Variables

Update your `.env.local` file with the deployed contract addresses:

```env
NEXT_PUBLIC_MIND_TOKEN_ADDRESS=0x9b39Fb4c93d80dF3E91a0369c5B6599Cf80873A4
NEXT_PUBLIC_MIND_STAKING_ADDRESS=0xA4Dc2B96Eef1D5189260eb4a7e53C482C439d1b4
NEXT_PUBLIC_AI_STRATEGY_MANAGER_ADDRESS=0xbe00F9a79aC39CD3FC8802bA1BF94Eae98C9d3f5
NEXT_PUBLIC_NEURO_WEALTH_VAULT_ADDRESS=0xD2D2cE855a37FB1FbbF131D869f3c17847B952F9
NEXT_PUBLIC_FEE_MANAGER_ADDRESS=0x0000000000000000000000000000000000000000
```

## Network Configuration

The contracts are deployed on CrossFi Testnet (Chain ID: 4157).

- **RPC URL**: `https://crossfi-testnet.g.alchemy.com/v2/FIQ1qwifmra7ZqdkVHnZ2lHQAKG8j4Yd`
- **Explorer**: `https://testnet-explorer.crossfi.com`
- **Native Token**: CFX 