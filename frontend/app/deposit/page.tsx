'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/layout/navbar';
import { GradientButton } from '@/components/ui/gradient-button';
import { GlowCard } from '@/components/ui/glow-card';
import { RiskSlider } from '@/components/ui/risk-slider';
import { useYieldMindStore } from '@/lib/store';
import { fetchProjectedAPY } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

const SUPPORTED_TOKENS = [
  { symbol: 'USDC', name: 'USD Coin', balance: 1250.45 },
  { symbol: 'USDT', name: 'Tether USD', balance: 890.12 },
  { symbol: 'DAI', name: 'Dai Stablecoin', balance: 2100.67 },
];

export default function DepositPage() {
  const { address, isConnected } = useAccount();
  const { 
    riskLevel, 
    selectedToken, 
    depositAmount, 
    projectedAPY,
    isLoading,
    setRiskLevel, 
    setSelectedToken, 
    setDepositAmount, 
    setProjectedAPY,
    setLoading
  } = useYieldMindStore();

  const [gasEstimate, setGasEstimate] = useState(0);

  useEffect(() => {
    const updateAPY = async () => {
      setLoading(true);
      try {
        const apy = await fetchProjectedAPY(riskLevel);
        setProjectedAPY(apy);
      } catch (error) {
        console.error('Failed to fetch APY:', error);
      } finally {
        setLoading(false);
      }
    };

    updateAPY();
  }, [riskLevel, setProjectedAPY, setLoading]);

  useEffect(() => {
    // Simulate gas estimation
    if (depositAmount) {
      setGasEstimate(Math.random() * 50 + 20);
    }
  }, [depositAmount]);

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Deposit successful! Your funds are being optimized.');
      // Redirect to dashboard or allocation preview
    } catch (error) {
      toast.error('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedTokenData = SUPPORTED_TOKENS.find(t => t.symbol === selectedToken);
  const depositValue = parseFloat(depositAmount) || 0;
  const projectedEarnings = (depositValue * projectedAPY) / 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="font-space-grotesk text-4xl font-bold text-white mb-2">
            Make a Deposit
          </h1>
          <p className="text-gray-300">
            Choose your token, set your risk preference, and let AI optimize your yields
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deposit Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Token Selection */}
            <GlowCard className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-glow-card">
              <h3 className="font-space-grotesk text-lg font-bold text-white mb-4 tracking-tight">Select Token</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SUPPORTED_TOKENS.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token.symbol)}
                    className={`p-4 rounded-xl border-2 font-space-grotesk font-semibold text-lg transition-all shadow-glow-card focus:outline-none ${
                      selectedToken === token.symbol
                        ? 'border-gradient-to-r from-green-400 via-blue-400 to-purple-400 animate-gradient-x ring-2 ring-green-400/40 shadow-lg scale-105'
                        : 'border-slate-700 bg-slate-800/70 hover:border-blue-400/60'
                    }`}
                  >
                    <div className="text-white font-semibold">{token.symbol}</div>
                    <div className="text-sm text-gray-400">{token.name}</div>
                    <div className="text-sm text-gray-300 mt-1">
                      Balance: {token.balance.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </GlowCard>

            {/* Amount Input */}
            <GlowCard>
              <h3 className="font-semibold text-white mb-4">Deposit Amount</h3>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-green-400"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {selectedToken}
                </div>
              </div>
              
              {selectedTokenData && (
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-400">
                    Available: {selectedTokenData.balance.toLocaleString()} {selectedToken}
                  </span>
                  <button 
                    onClick={() => setDepositAmount(selectedTokenData.balance.toString())}
                    className="text-green-400 hover:text-white transition-colors"
                  >
                    Max
                  </button>
                </div>
              )}
            </GlowCard>

            {/* Risk Slider */}
            <GlowCard className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-glow-card">
              <RiskSlider value={riskLevel} onChange={setRiskLevel} />
            </GlowCard>

            {/* Deposit Button */}
            <GradientButton
              onClick={handleDeposit}
              disabled={!isConnected || isLoading || !depositAmount}
              className="w-full font-space-grotesk text-lg py-4 shadow-glow-card transition-transform hover:scale-105"
              size="lg"
            >
              {isLoading ? 'Processing...' : 'Deposit & Optimize'}
            </GradientButton>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <GlowCard className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-glow-card">
              <h3 className="font-space-grotesk text-lg font-bold text-white mb-4 flex items-center tracking-tight">
                <TrendingUp className="w-6 h-6 mr-2 text-green-400 animate-pulse" />
                Projection
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-inter">Deposit Amount</span>
                  <span className="text-white font-ibm-plex-mono font-semibold">
                    ${depositValue.toLocaleString()} {selectedToken}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400 font-inter">Projected APY</span>
                  <span className="text-green-400 font-ibm-plex-mono font-semibold">
                    {isLoading ? '...' : `${projectedAPY.toFixed(1)}%`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-400 font-inter">Annual Earnings</span>
                  <span className="text-blue-400 font-ibm-plex-mono font-semibold">
                    ${projectedEarnings.toLocaleString()}
                  </span>
                </div>
                
                {gasEstimate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-inter">Est. Gas Cost</span>
                    <span className="text-gray-300 font-ibm-plex-mono">
                      ${gasEstimate.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </GlowCard>

            <GlowCard className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-glow-card">
              <h4 className="font-space-grotesk text-base font-bold text-white mb-3 tracking-tight">How it works</h4>
              <div className="space-y-3 text-sm text-gray-300 font-inter">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                  <p>AI analyzes 100+ DeFi protocols across 8 chains</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                  <p>Funds deployed to highest-yield opportunities</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                  <p>Continuous rebalancing for optimal returns</p>
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </div>
    </div>
  );
}