// Token configuration for Base Sepolia
// Replace placeholder addresses with real token addresses when available

export interface TokenConfig {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  isNative?: boolean;
  logoUrl?: string;
}

// Base Sepolia token configuration - USDC
export const BASE_SEPOLIA_TOKENS: TokenConfig[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x0000000000000000000000000000000000000000', // TODO: set Base Sepolia USDC
    decimals: 6,
    isNative: false,
    logoUrl: '/tokens/usdc.svg'
  }
];

// Token addresses that need to be updated with real addresses
export const PLACEHOLDER_ADDRESSES = ['0x0000000000000000000000000000000000000000'];

// Check if an address is a placeholder
export const isPlaceholderAddress = (address: string): boolean => {
  return PLACEHOLDER_ADDRESSES.includes(address.toLowerCase());
};

// Get token by symbol
export const getTokenBySymbol = (symbol: string): TokenConfig | undefined => {
  return BASE_SEPOLIA_TOKENS.find(token => token.symbol === symbol);
};

// Get supported tokens (native tokens + configured ERC20 tokens)
export const getSupportedTokens = (): TokenConfig[] => {
  return BASE_SEPOLIA_TOKENS.filter(token => token.isNative || !isPlaceholderAddress(token.address));
};

// Get native tokens only
export const getNativeTokens = (): TokenConfig[] => {
  return BASE_SEPOLIA_TOKENS.filter(token => token.isNative);
};

// Get ERC20 tokens that need addresses
export const getPlaceholderTokens = (): TokenConfig[] => {
  return BASE_SEPOLIA_TOKENS.filter(token => !token.isNative && isPlaceholderAddress(token.address));
};

// Mock addresses for development/testing on Base Sepolia
export const MOCK_TOKEN_ADDRESSES = {
  USDC: '0x0000000000000000000000000000000000000000'
};

export const TOKEN_UPDATE_INSTRUCTIONS = `
Base Sepolia Configuration:

Token:
- USDC (6 decimals) - set the correct address for Base Sepolia

Resources:
- Base docs: https://docs.base.org/
- Base Sepolia explorer: https://sepolia.basescan.org/
`;
