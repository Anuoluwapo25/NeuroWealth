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

// Somnia testnet token configuration - STT only
export const SOMNIA_TOKENS: TokenConfig[] = [
  {
    symbol: 'STT',
    name: 'Somnia Testnet Token',
    address: '0x0000000000000000000000000000000000000000', // Native token - use msg.value
    decimals: 18,
    isNative: true,
    logoUrl: '/tokens/stt.svg'
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

// Instructions for Somnia testnet - STT only
export const TOKEN_UPDATE_INSTRUCTIONS = `
Somnia Testnet Configuration - STT Only:

✅ Focused on STT (Somnia Testnet Token) for simplicity and testing.

Native Token:
- STT: Somnia Testnet Token (native, no contract address needed)

Getting STT Test Tokens:
- Join Somnia Discord: https://discord.gg/somnia
- Go to #dev-chat channel
- Tag @emma_odia for STT test tokens
- Or email: [email protected]

Resources:
- Documentation: https://docs.somnia.network
- Network Info: https://docs.somnia.network/developer/network-info
- Testnet Explorer: https://explorer.somnia.network

Note: ERC20 tokens will be added later once STT integration is perfected.
`;
