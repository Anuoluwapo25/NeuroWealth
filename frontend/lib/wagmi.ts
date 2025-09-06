import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, createConfig } from 'wagmi';

// Define Somnia chain manually since it's not in wagmi/chains
const somniaChain = {
  id: 50312,
  name: 'Somnia',
  nativeCurrency: {
    name: 'SOM',
    symbol: 'SOM',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://explorer.somnia.network',
    },
  },
} as const;

// Define Somnia Testnet manually
const somniaTestnetChain = {
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    name: 'SOM',
    symbol: 'SOM',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://explorer.somnia.network',
    },
  },
} as const;

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
  chains: [somniaTestnetChain, somniaChain, crossfiTestnetChain, crossfiChain], // Use Somnia as primary, CrossFi as fallback
  ssr: false,
});