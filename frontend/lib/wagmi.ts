import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, optimism, base } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'YieldMind',
  projectId: 'your-project-id', // Replace with your WalletConnect project ID
  chains: [mainnet, polygon, arbitrum, optimism, base],
  ssr: false,
});