// Mock API functions - replace with actual backend calls
export const mockData = {
  tvl: 245000000,
  averageAPY: 12.4,
  supportedChains: 8,
  userPortfolio: {
    totalValue: 15420.67,
    allocations: [
      { chain: 'Ethereum', protocol: 'Aave', amount: 5000, apy: 8.2, color: '#627EEA' },
      { chain: 'Polygon', protocol: 'Compound', amount: 3500, apy: 12.1, color: '#8247E5' },
      { chain: 'Arbitrum', protocol: 'Uniswap V3', amount: 4200, apy: 15.8, color: '#28A0F0' },
      { chain: 'Optimism', protocol: 'Synthetix', amount: 2720.67, apy: 9.7, color: '#FF0420' },
    ],
    historicalData: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 12000 + Math.random() * 4000 + i * 100,
    })),
  },
  rebalanceHistory: [
    { timestamp: Date.now() - 86400000, action: 'Rebalanced to Compound', amount: 2500 },
    { timestamp: Date.now() - 172800000, action: 'Moved funds to Arbitrum', amount: 1800 },
    { timestamp: Date.now() - 259200000, action: 'Optimized APY allocation', amount: 3200 },
  ],
};

export const fetchPortfolioData = async (address: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockData.userPortfolio;
};

export const fetchProjectedAPY = async (riskLevel: number) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return 8 + (riskLevel / 100) * 12; // 8-20% based on risk
};