import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, createConfig } from 'wagmi';

// Define Testnet only - STT Focus Mode
const testnetChain = {
  id: 50312,
  name: 'Testnet',
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://dream-rpc.network',
        'https://testnet-rpc.network',
        'https://rpc.network'
      ],
    },
    public: {
      http: [
        'https://dream-rpc.network',
        'https://testnet-rpc.network',
        'https://rpc.network'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Network Explorer',
      url: 'https://explorer.network',
    },
  },
} as const;

export const wagmiConfig = getDefaultConfig({
  appName: 'NeuroWealth',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Set this in .env.local
  chains: [testnetChain], // Testnet only - STT Focus Mode
  ssr: false,
});