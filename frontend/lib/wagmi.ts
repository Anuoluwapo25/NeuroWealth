import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, createConfig } from 'wagmi';

<<<<<<< HEAD
// Base Sepolia configuration
const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
=======
// Define Testnet only - STT Focus Mode
const testnetChain = {
  id: 50312,
  name: 'Testnet',
>>>>>>> baef29a7e515833f568b611e6804217cbd5ef1cf
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
<<<<<<< HEAD
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
=======
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
>>>>>>> baef29a7e515833f568b611e6804217cbd5ef1cf
    },
  },
} as const;

export const wagmiConfig = getDefaultConfig({
  appName: 'NeuroWealth',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID', // Set this in .env.local
<<<<<<< HEAD
  chains: [baseSepolia],
=======
  chains: [testnetChain], // Testnet only - STT Focus Mode
>>>>>>> baef29a7e515833f568b611e6804217cbd5ef1cf
  ssr: false,
});