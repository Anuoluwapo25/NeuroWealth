import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, createConfig } from 'wagmi';

// Define Somnia Testnet only - STT Focus Mode
const somniaTestnetChain = {
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: {
    name: 'STT',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://dream-rpc.somnia.network',
        'https://testnet-rpc.somnia.network',
        'https://rpc.somnia.network'
      ],
    },
    public: {
      http: [
        'https://dream-rpc.somnia.network',
        'https://testnet-rpc.somnia.network',
        'https://rpc.somnia.network'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://explorer.somnia.network',
    },
  },
} as const;

export const wagmiConfig = getDefaultConfig({
  appName: 'YieldMind',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Set this in .env.local
  chains: [somniaTestnetChain], // Somnia Testnet only - STT Focus Mode
  ssr: false,
});