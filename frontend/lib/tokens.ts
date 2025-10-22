// Token configuration for Base mainnet
// These addresses should be updated with real token addresses when available

export interface TokenConfig {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  isNative?: boolean;
  logoUrl?: string;
}

// Network token configuration - Base USDC
export const NETWORK_TOKENS: TokenConfig[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base mainnet USDC
    decimals: 6,
    isNative: false,
    logoUrl: '/tokens/usdc.svg'
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
  return NETWORK_TOKENS.find(token => token.symbol === symbol);
};

// Get supported tokens (native tokens + configured ERC20 tokens)
export const getSupportedTokens = (): TokenConfig[] => {
  return NETWORK_TOKENS.filter(token => token.isNative || !isPlaceholderAddress(token.address));
};

// Get native tokens only
export const getNativeTokens = (): TokenConfig[] => {
  return NETWORK_TOKENS.filter(token => token.isNative);
};

// Get ERC20 tokens that need addresses
export const getPlaceholderTokens = (): TokenConfig[] => {
  return NETWORK_TOKENS.filter(token => !token.isNative && isPlaceholderAddress(token.address));
};

// Mock token addresses for development/testing
// These should be replaced with real addresses from network explorer
export const MOCK_TOKEN_ADDRESSES = {
  USDC: '0x1234567890123456789012345678901234567890',
  USDT: '0x2345678901234567890123456789012345678901',
  DAI: '0x3456789012345678901234567890123456789012',
  SOMI: '0x0000000000000000000000000000000000000000' // Native token
};

// Instructions for Base mainnet - USDC
export const TOKEN_UPDATE_INSTRUCTIONS = `
Base Mainnet Configuration - USDC:

✅ Using Base mainnet with USDC for production deployment.

ERC20 Token:
- USDC: USD Coin on Base mainnet (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)

Getting USDC:
- Bridge USDC from Ethereum to Base
- Buy USDC directly on Base DEXs
- Use centralized exchanges that support Base

Resources:
- Documentation: https://docs.neurowealth.com
- Base Network: https://base.org
- Base Explorer: https://basescan.org
- USDC on Base: https://basescan.org/token/0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

Note: Production deployment on Base mainnet with USDC integration.
`;