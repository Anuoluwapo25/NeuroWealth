// Token configuration for Somnia network
// These addresses should be updated with real token addresses when available

export interface TokenConfig {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  isNative?: boolean;
  logoUrl?: string;
}

// Somnia testnet token configurations
export const SOMNIA_TOKENS: TokenConfig[] = [
  {
    symbol: 'STT',
    name: 'Somnia Testnet Token',
    address: '0x0000000000000000000000000000000000000000', // Native token - use msg.value
    decimals: 18,
    isNative: true,
    logoUrl: '/tokens/stt.svg'
  },
  {
    symbol: 'WSOMI',
    name: 'Wrapped Somnia Token',
    address: '0x046EDe9564A72571df6F5e44d0405360c0f4dCab', // Real address from Somnia docs
    decimals: 18,
    logoUrl: '/tokens/wsomi.svg'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x28bec7e30e6faee657a03e19bf1128aad7632a00', // Real address from Somnia docs
    decimals: 6,
    logoUrl: '/tokens/usdc.svg'
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0x67B302E35Aef5EEE8c32D934F5856869EF428330', // Real address from Somnia docs
    decimals: 6,
    logoUrl: '/tokens/usdt.svg'
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    address: '0x936Ab8C674bcb567CD5dEB85D8A216494704E9D8', // Real address from Somnia docs
    decimals: 18,
    logoUrl: '/tokens/weth.svg'
  }
];

// Token addresses that need to be updated with real addresses
export const PLACEHOLDER_ADDRESSES = [
  '0x0000000000000000000000000000000000000000' // Only native tokens use this
];

// Check if an address is a placeholder
export const isPlaceholderAddress = (address: string): boolean => {
  return PLACEHOLDER_ADDRESSES.includes(address.toLowerCase());
};

// Get token by symbol
export const getTokenBySymbol = (symbol: string): TokenConfig | undefined => {
  return SOMNIA_TOKENS.find(token => token.symbol === symbol);
};

// Get supported tokens (native tokens + configured ERC20 tokens)
export const getSupportedTokens = (): TokenConfig[] => {
  return SOMNIA_TOKENS.filter(token => token.isNative || !isPlaceholderAddress(token.address));
};

// Get native tokens only
export const getNativeTokens = (): TokenConfig[] => {
  return SOMNIA_TOKENS.filter(token => token.isNative);
};

// Get ERC20 tokens that need addresses
export const getPlaceholderTokens = (): TokenConfig[] => {
  return SOMNIA_TOKENS.filter(token => !token.isNative && isPlaceholderAddress(token.address));
};

// Mock token addresses for development/testing
// These should be replaced with real addresses from Somnia explorer
export const MOCK_TOKEN_ADDRESSES = {
  USDC: '0x1234567890123456789012345678901234567890',
  USDT: '0x2345678901234567890123456789012345678901',
  DAI: '0x3456789012345678901234567890123456789012',
  SOMI: '0x0000000000000000000000000000000000000000' // Native token
};

// Instructions for Somnia testnet
export const TOKEN_UPDATE_INSTRUCTIONS = `
Somnia Testnet Configuration:

✅ All token addresses are configured with real addresses from Somnia docs.

Native Token:
- STT: Somnia Testnet Token (native, no contract address needed)

ERC20 Tokens (Real Addresses):
- WSOMI: Wrapped Somnia Token
- USDC: USD Coin  
- USDT: Tether USD
- WETH: Wrapped Ethereum

Getting STT Test Tokens:
- Join Somnia Discord: https://discord.gg/somnia
- Go to #dev-chat channel
- Tag @emma_odia for STT test tokens
- Or email: [email protected]

Resources:
- Documentation: https://docs.somnia.network
- Network Info: https://docs.somnia.network/developer/network-info
- Testnet Explorer: https://explorer.somnia.network
`;
