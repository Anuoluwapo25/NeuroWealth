# Token Addresses Configuration

## Current Status

✅ **STT FOCUS MODE!** YieldMind is now focused exclusively on STT (Somnia Testnet Token) for simplified development and testing.

## Token Configuration

### Native Token (Ready to Use)
- **STT** - Somnia Testnet Token (native, no contract address needed)

### ERC20 Tokens (Temporarily Removed)
- **WSOMI** - Wrapped Somnia Token: `0x046EDe9564A72571df6F5e44d0405360c0f4dCab` *(will be added later)*
- **USDC** - USD Coin: `0x28bec7e30e6faee657a03e19bf1128aad7632a00` *(will be added later)*
- **USDT** - Tether USD: `0x67B302E35Aef5EEE8c32D934F5856869EF428330` *(will be added later)*
- **WETH** - Wrapped Ethereum: `0x936Ab8C674bcb567CD5dEB85D8A216494704E9D8` *(will be added later)*

## How to Update Token Addresses

### Step 1: Find Real Token Addresses

1. Visit the Somnia Explorer: https://explorer.somnia.network
2. Search for bridged tokens or check the official Somnia documentation
3. Look for:
   - USDC bridge contract
   - USDT bridge contract
   - DAI bridge contract

### Step 2: Update Configuration

Edit `/frontend/lib/tokens.ts`:

```typescript
export const SOMNIA_TOKENS: TokenConfig[] = [
  {
    symbol: 'SOMI',
    name: 'Somnia Token',
    address: '0x0000000000000000000000000000000000000000', // Native token
    decimals: 18,
    isNative: true,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xREAL_USDC_ADDRESS_HERE', // Replace with real address
    decimals: 6,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xREAL_USDT_ADDRESS_HERE', // Replace with real address
    decimals: 6,
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    address: '0xREAL_DAI_ADDRESS_HERE', // Replace with real address
    decimals: 18,
  }
];
```

### Step 3: Test Integration

1. Start the frontend: `npm run dev`
2. Connect wallet to Somnia testnet
3. Try depositing with the updated token addresses
4. Verify transactions appear on Somnia explorer

## Alternative: Deploy Mock Tokens

If real bridged tokens are not available, you can deploy mock ERC20 tokens for testing:

```bash
# In smartcontract directory
npx hardhat run scripts/deploy-mock-tokens.ts --network somniaTestnet
```

## Getting STT Test Tokens

For development on Somnia testnet, you need STT (Somnia Testnet Token):

1. **Join Somnia Discord**: https://discord.gg/somnia
2. **Go to #dev-chat channel**
3. **Tag @emma_odia** and request STT test tokens
4. **Alternative**: Email [email protected] with:
   - Brief description of what you're building
   - Your GitHub profile

**Note**: STT is the native token for Somnia testnet. 

## Why STT Focus Mode?

This simplified approach offers several advantages:

1. **Simpler Development**: Focus on one token type (native) without ERC20 complexity
2. **Easier Testing**: No need to handle token approvals or transfers
3. **Faster Iteration**: Perfect the core functionality before adding complexity
4. **Lower Risk**: Native tokens are simpler and safer to work with
5. **Clear Path**: Once STT integration is perfect, ERC20 tokens can be added incrementally

ERC20 tokens will be added back once STT integration is fully tested and working perfectly.

## Resources

- [Somnia Documentation](https://docs.somnia.network)
- [Somnia Explorer](https://explorer.somnia.network)
- [Network Information](https://docs.somnia.network/developer/network-info)
- [How to Bridge](https://docs.somnia.network/get-started/how-to-bridge)
- [Using Native Somnia Token](https://docs.somnia.network/developer/tutorials/using-native-somnia-token-somi)

## Notes

- SOMI is the native token and doesn't need a contract address
- Token addresses may change between testnet and mainnet
- Always verify addresses on the official explorer before using
- Consider implementing token address validation in the frontend

## Current Placeholder Behavior

- Tokens with placeholder addresses show "Address needed" warning
- Users can see token selection but cannot deposit
- SOMI token is available for testing (native token)
- Mock balances are shown for development purposes
