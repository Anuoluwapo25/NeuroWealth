'use client';

import { useState } from 'react';
import { TrendingUp, Lock, Clock, DollarSign } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { GlowCard } from '@/components/ui/glow-card';
import { Navbar } from '@/components/layout/navbar';

export default function StakingPage() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedTier, setSelectedTier] = useState('premium');

  const tiers = [
    {
      name: 'Premium',
      mindRequired: '100 MIND',
      depositLimit: '$100,000',
      rebalanceFreq: '4 hours',
      apy: '18%',
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Pro',
      mindRequired: '500 MIND',
      depositLimit: '$1,000,000',
      rebalanceFreq: '1 hour',
      apy: '22%',
      color: 'from-green-400 to-green-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <h1 className="font-space-grotesk text-5xl font-bold text-white mb-6">
            Stake <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">MIND Tokens</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock premium features and higher deposit limits by staking MIND tokens
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Staking Form */}
          <div>
            <GlowCard className="p-8">
              <h2 className="font-space-grotesk text-2xl font-bold text-white mb-6">Stake MIND Tokens</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Select Tier</label>
                  <div className="grid grid-cols-2 gap-4">
                    {tiers.map((tier, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTier(tier.name.toLowerCase())}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                          selectedTier === tier.name.toLowerCase()
                            ? 'border-green-400 bg-green-400/10'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className={`w-8 h-8 bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-2`}>
                          {tier.name[0]}
                        </div>
                        <div className="text-white font-semibold">{tier.name}</div>
                        <div className="text-gray-400 text-sm">{tier.mindRequired}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Amount to Stake</label>
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Enter MIND amount"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                  />
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3">Staking Benefits</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-400 mr-2" />
                      Higher deposit limits
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-green-400 mr-2" />
                      Faster rebalancing
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
                      Access to premium protocols
                    </div>
                    <div className="flex items-center">
                      <Lock className="w-4 h-4 text-green-400 mr-2" />
                      Priority support
                    </div>
                  </div>
                </div>

                <GradientButton size="lg" className="w-full">
                  Stake MIND Tokens
                </GradientButton>
              </div>
            </GlowCard>
          </div>

          {/* Tier Comparison */}
          <div>
            <GlowCard className="p-8">
              <h2 className="font-space-grotesk text-2xl font-bold text-white mb-6">Tier Comparison</h2>
              
              <div className="space-y-6">
                {tiers.map((tier, index) => (
                  <div key={index} className="border border-slate-600 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                        {tier.name[0]}
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-lg">{tier.apy}</div>
                        <div className="text-gray-400 text-sm">Expected APY</div>
                      </div>
                    </div>
                    
                    <h3 className="font-space-grotesk text-xl font-bold text-white mb-3">{tier.name}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Required:</span>
                        <span className="text-white font-semibold">{tier.mindRequired}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Deposit Limit:</span>
                        <span className="text-white font-semibold">{tier.depositLimit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Rebalance:</span>
                        <span className="text-white font-semibold">{tier.rebalanceFreq}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          </div>
        </div>
      </div>
    </div>
  );
}
