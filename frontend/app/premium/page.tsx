'use client';

import { useState } from 'react';
import { ArrowLeft, Zap, Crown, Star, Check, Shield, TrendingUp, Activity, Users, Globe } from 'lucide-react';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/layout/navbar';
import { GradientButton } from '@/components/ui/gradient-button';
import { GlowCard } from '@/components/ui/glow-card';
import Link from 'next/link';
import toast from 'react-hot-toast';

const PLATFORM_FEATURES = [
  {
    name: 'Core DeFi Features',
    description: 'Essential blockchain functionality',
    features: [
      'Native STT token deposits & withdrawals',
      '15% APY yield generation',
      'Real-time position tracking',
      'Secure MetaMask integration',
      'Gas-optimized transactions',
      'Smart contract security',
    ],
    color: 'from-blue-400 to-cyan-500',
    icon: Shield,
    status: 'Active',
  },
  {
    name: 'Advanced Analytics',
    description: 'Professional portfolio management',
    features: [
      'Live portfolio dashboard',
      'Performance metrics & ROI',
      'Real-time APY tracking',
      'Transaction history',
      'Position value monitoring',
      'Yield calculations',
    ],
    color: 'from-green-400 to-emerald-500',
    icon: TrendingUp,
    status: 'Active',
  },
  {
    name: 'Yield Optimization',
    description: 'Maximize your returns',
    features: [
      'Automated rewards claiming',
      'Compound interest simulation',
      'Risk assessment tools',
      'Multi-protocol integration ready',
      'Smart rebalancing algorithms',
      'APY optimization strategies',
    ],
    color: 'from-purple-400 to-pink-500',
    icon: Crown,
    status: 'Active',
  },
];

const PLATFORM_STATS = [
  {
    title: 'Total Value Locked',
    value: '0.9914 STT',
    description: 'Real funds secured on blockchain',
    color: 'text-blue-400',
    icon: Activity,
  },
  {
    title: 'Current APY',
    value: '15.0%',
    description: 'Annual percentage yield',
    color: 'text-green-400',
    icon: TrendingUp,
  },
  {
    title: 'Active Users',
    value: '1+',
    description: 'Growing community',
    color: 'text-purple-400',
    icon: Users,
  },
  {
    title: 'Network',
    value: 'Blockchain',
    description: 'Testnet deployment',
    color: 'text-yellow-400',
    icon: Globe,
  },
];

const TECHNICAL_SPECS = [
  {
    category: 'Smart Contracts',
    items: [
      'SimplifiedVault - Core vault contract',
      'Yield Protocol - 15% APY protocol',
      'MindStaking Protocol - User tier management',
      'OpenZeppelin security standards',
      'ReentrancyGuard protection',
      'Pausable functionality',
    ]
  },
  {
    category: 'Frontend Technology',
    items: [
      'Next.js 14 with TypeScript',
      'Ethers.js v6 integration',
      'Real-time data updates',
      'Responsive design',
      'Professional UI components',
      'Error handling & validation',
    ]
  },
  {
    category: 'Blockchain Integration',
    items: [
      'Blockchain deployment',
      'MetaMask wallet connection',
      'Gas estimation & optimization',
      'Transaction monitoring',
      'Real-time balance updates',
      'Network switching support',
    ]
  }
];

export default function PremiumPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h1 className="font-space-grotesk text-5xl font-bold text-white mb-4">
              NeuroWealth <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Platform</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Professional DeFi platform with real yield generation, advanced analytics, 
              secure smart contracts, and comprehensive portfolio management
            </p>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {PLATFORM_STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <GlowCard key={index} className="hover:scale-105 transition-transform duration-200">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    {stat.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.description}
                  </div>
                </div>
              </GlowCard>
            );
          })}
        </div>

        {/* Platform Features */}
        <div className="mb-12">
          <h2 className="font-space-grotesk text-3xl font-bold text-white text-center mb-8">
            Platform <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Features</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {PLATFORM_FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <GlowCard key={index} className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-glow-card">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${feature.color} mr-3`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-space-grotesk text-2xl font-bold text-white mb-1 tracking-tight">
                        {feature.name}
                      </h3>
                      <p className="text-slate-400 text-sm font-inter">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {feature.features.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-slate-200 font-inter text-sm">{item}</span>
                      </div>
                    ))} 
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-sm font-medium">
                      ✓ {feature.status}
                    </span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </GlowCard>
            );
          })}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="mb-12">
          <h2 className="font-space-grotesk text-3xl font-bold text-white text-center mb-8">
            Technical <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Specifications</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TECHNICAL_SPECS.map((spec, index) => (
              <GlowCard key={index} className="hover:scale-105 transition-transform duration-200">
                <h3 className="font-space-grotesk text-xl font-bold text-white mb-4 text-center">
                  {spec.category}
              </h3>
                <div className="space-y-3">
                  {spec.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-200 font-inter text-sm">{item}</span>
                  </div>
                  ))}
                </div>
              </GlowCard>
            ))}
                  </div>
                </div>
                
        {/* Call to Action */}
                <div className="text-center">
          <GlowCard className="max-w-4xl mx-auto">
            <div className="py-8">
              <h2 className="font-space-grotesk text-3xl font-bold text-white mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join NeuroWealth and start earning 15% APY on your STT tokens. 
                Professional DeFi platform with real yield generation and advanced analytics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/deposit-ethers">
                  <GradientButton size="lg" className="px-8 py-4">
                    Start Depositing
                  </GradientButton>
                </Link>
                <Link href="/dashboard">
                  <GradientButton size="lg" className="px-8 py-4 bg-slate-700 hover:bg-slate-600">
                    View Dashboard
                  </GradientButton>
                </Link>
              </div>
            </div>
          </GlowCard>
        </div>

        {/* Platform Benefits */}
        <div className="mt-12">
          <h2 className="font-space-grotesk text-3xl font-bold text-white text-center mb-8">
            Why Choose <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">NeuroWealth</span>?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlowCard className="text-center hover:scale-105 transition-transform duration-200">
              <div className="p-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-space-grotesk text-lg font-bold text-white mb-2">Secure</h3>
                <p className="text-gray-400 text-sm">OpenZeppelin security standards with comprehensive protection</p>
              </div>
            </GlowCard>
            
            <GlowCard className="text-center hover:scale-105 transition-transform duration-200">
              <div className="p-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-space-grotesk text-lg font-bold text-white mb-2">Profitable</h3>
                <p className="text-gray-400 text-sm">15% APY with real yield generation on blockchain</p>
              </div>
            </GlowCard>
            
            <GlowCard className="text-center hover:scale-105 transition-transform duration-200">
              <div className="p-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-space-grotesk text-lg font-bold text-white mb-2">Real-time</h3>
                <p className="text-gray-400 text-sm">Live updates and real-time portfolio tracking</p>
              </div>
            </GlowCard>
            
            <GlowCard className="text-center hover:scale-105 transition-transform duration-200">
              <div className="p-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-space-grotesk text-lg font-bold text-white mb-2">Professional</h3>
                <p className="text-gray-400 text-sm">Enterprise-grade platform with advanced analytics</p>
              </div>
            </GlowCard>
          </div>
        </div>
      </div>
    </div>
  );
}