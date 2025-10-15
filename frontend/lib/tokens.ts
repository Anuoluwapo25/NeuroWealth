<<<<<<< HEAD
// Token configuration for Base Sepolia
// Replace placeholder addresses with real token addresses when available
=======
// Token configuration for network
// These addresses should be updated with real token addresses when available
>>>>>>> baef29a7e515833f568b611e6804217cbd5ef1cf

export interface TokenConfig {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  isNative?: boolean;
  logoUrl?: string;
}

<<<<<<< HEAD
// Base Sepolia token configuration - USDC
export const BASE_SEPOLIA_TOKENS: TokenConfig[] = [
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x0000000000000000000000000000000000000000', // TODO: set Base Sepolia USDC
    decimals: 6,
    isNative: false,
    logoUrl: '/tokens/usdc.svg'
=======
// Network token configuration - STT only
export const NETWORK_TOKENS: TokenConfig[] = [
  {
    symbol: 'STT',
    name: 'Testnet Token',
    address: '0x0000000000000000000000000000000000000000', // Native token - use msg.value
    decimals: 18,
    isNative: true,
    logoUrl: '/tokens/stt.svg'
>>>>>>> baef29a7e515833f568b611e6804217cbd5ef1cf
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
<<<<<<< HEAD
  return BASE_SEPOLIA_TOKENS.find(token => token.symbol === symbol);
=======
  return NETWORK_TOKENS.find(token => token.symbol === symbol);
>>>>>>> baef29a7e515833f568b611e6804217cbd5ef1cf
};

// Get supported tokens (native tokens + configured ERC20 tokens)
export const getSupportedTokens = (): TokenConfig[] => {
<<<<<<< HEAD
  return BASE_SEPOLIA_TOKENS.filter(token => token.isNative || !isPlaceholderAddress(token.address));
=======
  return NETWORK_TOKENS.filter(token => token.isNative || !isPlaceholderAddress(token.address));
>>>>>>> baef29a7e515833f568b611e6804217cbd5ef1cf
};

// Get native tokens only
export const getNativeTokens = (): TokenConfig[] => {
<<<<<<< HEAD
  return BASE_SEPOLIA_TOKENS.filter(token => token.isNative);
=======
  return NETWORK_TOKENS.filter(token => token.isNative);
>>>>>>> baef29a7e515833f568b611e6804217cbd5ef1cf
};

// Get ERC20 tokens that need addresses
export const getPlaceholderTokens = (): TokenConfig[] => {
<<<<<<< HEAD
  return BASE_SEPOLIA_TOKENS.filter(token => !token.isNative && isPlaceholderAddress(token.address));
};

// Mock addresses for development/testing on Base Sepolia
=======
  return NETWORK_TOKENS.filter(token => !token.isNative && isPlaceholderAddress(token.address));
};

// Mock token addresses for development/testing
// These should be replaced with real addresses from network explorer
>>>>>>> baef29a7e515833f568b611e6804217cbd5ef1cf
export const MOCK_TOKEN_ADDRESSES = {
  USDC: '0x0000000000000000000000000000000000000000'
};

<<<<<<< HEAD
export const TOKEN_UPDATE_INSTRUCTIONS = `
Base Sepolia Configuration:

Token:
- USDC (6 decimals) - set the correct address for Base Sepolia

Resources:
- Base docs: https://docs.base.org/
- Base Sepolia explorer: https://sepolia.basescan.org/
=======
// Instructions for testnet - STT only
export const TOKEN_UPDATE_INSTRUCTIONS = `
Testnet Configuration - STT Only:

✅ Focused on STT (Testnet Token) for simplicity and testing.

Native Token:
- STT: Testnet Token (native, no contract address needed)

Getting STT Test Tokens:
- Join our Discord: https://discord.gg/neurowealth
- Go to #dev-chat channel
- Tag @support for STT test tokens
- Or email: [email protected]

Resources:
- Documentation: https://docs.neurowealth.com
- Network Info: https://docs.neurowealth.com/developer/network-info
- Testnet Explorer: https://explorer.network

Note: ERC20 tokens will be added later once STT integration is perfected.
>>>>>>> baef29a7e515833f568b611e6804217cbd5ef1cf
`;
