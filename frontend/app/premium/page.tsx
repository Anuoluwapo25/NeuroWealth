'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, Crown, Star, Check } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/layout/navbar';
import { GradientButton } from '@/components/ui/gradient-button';
import { GlowCard } from '@/components/ui/glow-card';
import Link from 'next/link';
import toast from 'react-hot-toast';

const PREMIUM_TIERS = [
  {
    name: 'Premium',
    price: 100,
    xfiRequired: 1000,
    features: [
      'Advanced AI analytics',
      'Priority rebalancing',
      'Custom risk profiles',
      'Detailed yield reports',
      'Email notifications',
    ],
    color: 'from-blue-400 to-purple-500',
    icon: Star,
  },
  {
    name: 'Elite',
    price: 500,
    xfiRequired: 5000,
    features: [
      'All Premium features',
      'Personal yield strategist',
      'Early access to new protocols',
      'Custom dashboard themes',
      'Priority customer support',
      'Institutional-grade security',
    ],
    color: 'from-purple-400 to-pink-500',
    icon: Crown,
  },
];

export default function PremiumPage() {
  const { address, isConnected } = useAccount();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);

  const handleStake = async (tierIndex: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const tier = PREMIUM_TIERS[tierIndex];
    const amount = parseFloat(stakeAmount);

    if (!amount || amount < tier.xfiRequired) {
      toast.error(`Minimum ${tier.xfiRequired} XFI required for ${tier.name} tier`);
      return;
    }

    setIsStaking(true);
    try {
      // Simulate staking transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Successfully staked ${amount} XFI for ${tier.name} tier!`);
      setStakeAmount('');
      setSelectedTier(null);
    } catch (error) {
      toast.error('Staking failed. Please try again.');
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="font-space-grotesk text-5xl font-bold text-white mb-4">
              Unlock <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Premium</span> Features
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Stake XFI tokens to access advanced AI analytics, priority rebalancing, and exclusive yield strategies
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {PREMIUM_TIERS.map((tier, index) => {
            const Icon = tier.icon;
            const isSelected = selectedTier === index;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlowCard className={`transition-transform duration-200 hover:scale-[1.02] hover:shadow-glow-card ${isSelected ? 'ring-2 ring-yellow-400 shadow-lg scale-105' : ''}`}>
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${tier.color} mr-3 animate-pulse`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="font-space-grotesk text-2xl font-bold text-white mb-1 tracking-tight">
                        {tier.name}
                      </h2>
                      <p className="text-slate-400 text-xs font-inter tracking-wide">
                        {tier.xfiRequired.toLocaleString()} XFI required
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 animate-pulse" />
                        <span className="text-slate-200 font-inter text-sm">{feature}</span>
                      </div>
                    ))} 
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-2 font-inter tracking-wide">
                        XFI Amount to Stake
                      </label>
                      <input
                        type="number"
                        value={selectedTier === index ? stakeAmount : ''}
                        onChange={(e) => {
                          setSelectedTier(index);
                          setStakeAmount(e.target.value);
                        }}
                        placeholder={`Min ${tier.xfiRequired} XFI`}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white font-ibm-plex-mono focus:outline-none focus:border-yellow-400"
                      />
                    </div>

                    <GradientButton
                      onClick={() => handleStake(index)}
                      disabled={!isConnected || isStaking || !stakeAmount}
                      className="w-full font-space-grotesk text-lg py-4 shadow-glow-card transition-transform hover:scale-105"
                      size="lg"
                    >
                      {isStaking ? 'Staking...' : `Stake for ${tier.name}`}
                    </GradientButton>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlowCard className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-glow-card">
            <div className="text-center">
              <h3 className="font-space-grotesk text-2xl font-bold text-white mb-4 tracking-tight">
                How XFI Staking Works
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <span className="text-white font-bold text-xl font-ibm-plex-mono">1</span>
                  </div>
                  <h4 className="font-space-grotesk font-semibold text-white mb-2">Stake XFI</h4>
                  <p className="text-slate-400 text-sm font-inter">
                    Lock your XFI tokens to access premium features
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <span className="text-white font-bold text-xl font-ibm-plex-mono">2</span>
                  </div>
                  <h4 className="font-space-grotesk font-semibold text-white mb-2">Unlock Features</h4>
                  <p className="text-slate-400 text-sm font-inter">
                    Instantly access advanced AI analytics and tools
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <span className="text-white font-bold text-xl font-ibm-plex-mono">3</span>
                  </div>
                  <h4 className="font-space-grotesk font-semibold text-white mb-2">Earn Rewards</h4>
                  <p className="text-slate-400 text-sm font-inter">
                    Earn additional rewards while staking XFI tokens
                  </p>
                </div>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </div>
    </div>
  );
}