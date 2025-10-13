import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, createConfig } from 'wagmi';

// Base Sepolia configuration
const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.base.org']
    },
    public: {
      http: ['https://sepolia.base.org']
    }
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org',
    },
  },
} as const;

export const wagmiConfig = getDefaultConfig({
  appName: 'NeuroWealth',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Set this in .env.local
  chains: [baseSepolia],
  ssr: false,
});