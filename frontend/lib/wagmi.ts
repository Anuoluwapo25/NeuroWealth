import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, createConfig } from 'wagmi';

// Define CrossFi chain manually since it's not in wagmi/chains
const crossfiChain = {
  id: 4157,
  name: 'CrossFi',
  nativeCurrency: {
    name: 'CFX',
    symbol: 'CFX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.crossfi.com'],
    },
    public: {
      http: ['https://rpc.crossfi.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CrossFi Explorer',
      url: 'https://explorer.crossfi.com',
    },
  },
} as const;

// Define CrossFi Testnet manually
const crossfiTestnetChain = {
  id: 4158,
  name: 'CrossFi Testnet',
  nativeCurrency: {
    name: 'CFX',
    symbol: 'CFX',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.crossfi.com'],
    },
    public: {
      http: ['https://testnet-rpc.crossfi.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CrossFi Testnet Explorer',
      url: 'https://testnet-explorer.crossfi.com',
    },
  },
} as const;

export const wagmiConfig = getDefaultConfig({
  appName: 'YieldMind',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Set this in .env.local
  chains: [crossfiTestnetChain, crossfiChain], // Use CrossFi chains
  ssr: false,
});