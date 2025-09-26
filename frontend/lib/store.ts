import { create } from 'zustand';

interface Portfolio {
  totalValue: number;
  allocations: Array<{
    chain: string;
    protocol: string;
    amount: number;
    apy: number;
    color: string;
  }>;
  historicalData: Array<{
    date: string;
    value: number;
  }>;
}

interface NeuroWealthStore {
  portfolio: Portfolio;
  riskLevel: number;
  selectedToken: string;
  depositAmount: string;
  projectedAPY: number;
  isLoading: boolean;
  setRiskLevel: (level: number) => void;
  setSelectedToken: (token: string) => void;
  setDepositAmount: (amount: string) => void;
  setProjectedAPY: (apy: number) => void;
  setLoading: (loading: boolean) => void;
  updatePortfolio: (portfolio: Portfolio) => void;
}

export const useNeuroWealthStore = create<NeuroWealthStore>((set) => ({
  portfolio: {
    totalValue: 0,
    allocations: [],
    historicalData: [],
  },
  riskLevel: 50,
  selectedToken: 'USDC',
  depositAmount: '',
  projectedAPY: 0,
  isLoading: false,
  setRiskLevel: (level) => set({ riskLevel: level }),
  setSelectedToken: (token) => set({ selectedToken: token }),
  setDepositAmount: (amount) => set({ depositAmount: amount }),
  setProjectedAPY: (apy) => set({ projectedAPY: apy }),
  setLoading: (loading) => set({ isLoading: loading }),
  updatePortfolio: (portfolio) => set({ portfolio }),
}));