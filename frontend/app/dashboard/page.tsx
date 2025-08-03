'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Download, Settings } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/layout/navbar';
import { GradientButton } from '@/components/ui/gradient-button';
import { GlowCard } from '@/components/ui/glow-card';
import { Skeleton } from '@/components/ui/skeleton';
import { PortfolioOverview } from '@/components/dashboard/portfolio-overview';
import { PortfolioPie } from '@/components/charts/portfolio-pie';
import { PerformanceChart } from '@/components/charts/performance-chart';
import { RebalanceHistory } from '@/components/dashboard/rebalance-history';
import { AIInsights } from '@/components/dashboard/ai-insights';
import { useYieldMindStore } from '@/lib/store';
import { fetchPortfolioData, mockData } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { portfolio, isLoading, setLoading, updatePortfolio } = useYieldMindStore();
  const [refreshing, setRefreshing] = useState(false);

  // Mock AI insights data
  const aiInsights = [
    {
      type: 'opportunity' as const,
      title: 'High Yield Detected on Arbitrum',
      description: 'New liquidity pool offering 18.5% APY detected. AI recommends moving 15% of USDC allocation.',
      impact: '+2.3% portfolio APY',
      confidence: 87,
    },
    {
      type: 'optimization' as const,
      title: 'Gas Optimization Available',
      description: 'Current gas prices are 40% below average. Optimal time for rebalancing operations.',
      impact: '$45 gas savings',
      confidence: 92,
    },
    {
      type: 'risk' as const,
      title: 'Protocol Risk Assessment',
      description: 'Compound allocation showing elevated smart contract risk. Consider diversification.',
      impact: 'Risk reduction',
      confidence: 76,
    },
  ];

  const rebalanceHistory = [
    {
      timestamp: Date.now() - 86400000,
      action: 'Optimized yield allocation',
      amount: 2500,
      fromProtocol: 'Aave',
      toProtocol: 'Compound',
      gasCost: 15.32,
    },
    {
      timestamp: Date.now() - 172800000,
      action: 'Cross-chain rebalance',
      amount: 1800,
      fromProtocol: 'Ethereum',
      toProtocol: 'Arbitrum',
      gasCost: 42.18,
    },
    {
      timestamp: Date.now() - 259200000,
      action: 'Risk adjustment',
      amount: 3200,
      gasCost: 8.74,
    },
  ];

  useEffect(() => {
    const loadPortfolioData = async () => {
      if (!isConnected || !address) return;

      setLoading(true);
      try {
        const data = await fetchPortfolioData(address);
        updatePortfolio(data);
      } catch (error) {
        console.error('Failed to load portfolio:', error);
        toast.error('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, [address, isConnected, setLoading, updatePortfolio]);

  const handleRefresh = async () => {
    if (!address) return;
    
    setRefreshing(true);
    try {
      const data = await fetchPortfolioData(address);
      updatePortfolio(data);
      toast.success('Portfolio data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleWithdraw = () => {
    toast.success('Withdraw functionality coming soon!');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-300 mb-8">Please connect your wallet to view your dashboard</p>
          <Link href="/">
            <GradientButton>Go Back Home</GradientButton>
          </Link>
        </div>
      </div>
    );
  }

  const portfolioData = portfolio.totalValue > 0 ? portfolio : mockData.userPortfolio;
  const totalEarnings = portfolioData.totalValue * 0.124; // 12.4% earnings
  const change24h = portfolioData.totalValue * 0.032; // 3.2% daily change
  const change7d = portfolioData.totalValue * 0.087; // 8.7% weekly change

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors mb-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <h1 className="font-space-grotesk text-4xl font-bold text-white mb-2">
                Portfolio Dashboard
              </h1>
              <p className="text-gray-300">
                AI-optimized yield farming across multiple chains
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-6 md:mt-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <GradientButton onClick={handleWithdraw} size="md">
                Withdraw Funds
              </GradientButton>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-24 rounded-xl bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 shadow-glow-card animate-gradient-move"
              />
            ))}
          </div>
        ) : (
          <PortfolioOverview
            totalValue={portfolioData.totalValue}
            change24h={change24h}
            change7d={change7d}
            totalEarnings={totalEarnings}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <GlowCard>
              <h3 className="font-space-grotesk text-xl font-semibold text-white mb-4">
                Portfolio Allocation
              </h3>
              {isLoading ? (
                <Skeleton className="h-80 rounded-lg bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 shadow-glow-card animate-gradient-move" />
              ) : (
                <PortfolioPie data={portfolioData.allocations} />
              )}
            </GlowCard>
          </div>

          <div>
            <GlowCard>
              <h3 className="font-space-grotesk text-xl font-semibold text-white mb-4">
                Performance History
              </h3>
              {isLoading ? (
                <Skeleton className="h-80 rounded-lg bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 shadow-glow-card animate-gradient-move" />
              ) : (
                <PerformanceChart data={portfolioData.historicalData} />
              )}
            </GlowCard>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <AIInsights insights={aiInsights} />
          </div>

          <div>
            <RebalanceHistory events={rebalanceHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}