'use client';

import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { GlowCard } from '@/components/ui/glow-card';

interface PortfolioOverviewProps {
  totalValue: number;
  change24h: number;
  change7d: number;
  totalEarnings: number;
}

export function PortfolioOverview({ 
  totalValue, 
  change24h, 
  change7d, 
  totalEarnings 
}: PortfolioOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
    
    return (
      <div className={`flex items-center space-x-1 ${colorClass}`}>
        <Icon className="w-4 h-4" />
        <span>{Math.abs(value).toFixed(2)}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div>
        <GlowCard className="transition-transform duration-200 hover:scale-[1.03] hover:shadow-glow-card focus-within:scale-[1.03] focus-within:shadow-glow-card cursor-pointer" >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-inter tracking-wide">Total Portfolio Value</p>
              <p className="text-3xl font-space-grotesk font-bold text-white mt-1">
                <span className="font-ibm-plex-mono tracking-tight">{formatCurrency(totalValue)}</span>
              </p>
            </div>
            <div className="p-3 bg-green-400/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </GlowCard>
      </div>

      <div>
        <GlowCard className="transition-transform duration-200 hover:scale-[1.03] hover:shadow-glow-card focus-within:scale-[1.03] focus-within:shadow-glow-card cursor-pointer" >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-inter tracking-wide">24h Change</p>
              <p className="text-2xl font-space-grotesk font-semibold text-white mt-1">
                <span className="font-ibm-plex-mono tracking-tight">{formatCurrency(Math.abs(change24h))}</span>
              </p>
            </div>
            <div>
              {formatPercentage((change24h / totalValue) * 100)}
            </div>
          </div>
        </GlowCard>
      </div>

      <div>
        <GlowCard className="transition-transform duration-200 hover:scale-[1.03] hover:shadow-glow-card focus-within:scale-[1.03] focus-within:shadow-glow-card cursor-pointer" >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-inter tracking-wide">7d Change</p>
              <p className="text-2xl font-space-grotesk font-semibold text-white mt-1">
                <span className="font-ibm-plex-mono tracking-tight">{formatCurrency(Math.abs(change7d))}</span>
              </p>
            </div>
            <div>
              {formatPercentage((change7d / totalValue) * 100)}
            </div>
          </div>
        </GlowCard>
      </div>

      <div>
        <GlowCard className="transition-transform duration-200 hover:scale-[1.03] hover:shadow-glow-card focus-within:scale-[1.03] focus-within:shadow-glow-card cursor-pointer" >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Earnings</p>
              <p className="text-3xl font-space-grotesk font-bold text-green-400 mt-1">
                <span className="font-ibm-plex-mono tracking-tight">{formatCurrency(totalEarnings)}</span>
              </p>
            </div>
            <div className="p-3 bg-blue-400/20 rounded-lg">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}