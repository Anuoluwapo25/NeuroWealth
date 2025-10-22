import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, createConfig } from 'wagmi';

// Define Base mainnet
const baseChain = {
  id: 8453,
  name: 'Base',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://mainnet.base.org',
        'https://base-mainnet.public.blastapi.io',
        'https://base.blockpi.network/v1/rpc/public'
      ],
    },
    public: {
      http: [
        'https://mainnet.base.org',
        'https://base-mainnet.public.blastapi.io',
        'https://base.blockpi.network/v1/rpc/public'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://basescan.org',
    },
  },
} as const;

export const wagmiConfig = getDefaultConfig({
  appName: 'NeuroWealth',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [baseChain], // Base mainnet
  ssr: false,
});