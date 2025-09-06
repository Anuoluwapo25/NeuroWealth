'use client';

import { TrendingUp, Zap, Shield, Globe, Brain, Users, BarChart3, Lock, ArrowRight, CheckCircle, Star, Target, Cpu, DollarSign } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { GlowCard } from '@/components/ui/glow-card';
import { Navbar } from '@/components/layout/navbar';
import { mockData } from '@/lib/api';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div
            className="text-center"
          >
            <h1 className="font-space-grotesk text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              The Future of{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                DeFi Investing
              </span>{' '}
              is Here
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              YieldMind leverages cutting-edge AI to automatically optimize your cryptocurrency investments across Somnia's ecosystem, 
              delivering superior returns while managing risk intelligently.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {/* Animated gradient blob */}
              <div className="absolute left-1/2 top-[-80px] -translate-x-1/2 z-[-1] w-[400px] h-[400px] bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
              <Link href="/deposit">
                <GradientButton size="lg" className="w-full sm:w-auto">
                  Start Earning Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </GradientButton>
              </Link>
              <Link href="/dashboard">
                <button className="px-8 py-4 border border-slate-600 text-white rounded-xl font-space-grotesk font-semibold hover:border-green-400 transition-colors shadow-glow-card hover:scale-105">
                  View Live Dashboard
                </button>
              </Link>
            </div>

            {/* Process Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { step: '1', title: 'Connect & Deposit', desc: 'Connect your wallet and deposit USDC, USDT, DAI, or SOMI tokens' },
                { step: '2', title: 'AI Analysis', desc: 'Our AI scans Somnia protocols for optimal yield opportunities' },
                { step: '3', title: 'Auto-Deploy', desc: 'Funds automatically deployed across best-performing protocols' },
                { step: '4', title: 'Earn & Grow', desc: 'Watch your portfolio grow with continuous optimization' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3 animate-pulse">
                    {item.step}
                  </div>
                  <h3 className="font-space-grotesk text-lg font-bold text-white mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-gray-400 font-inter">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-ibm-plex-mono font-bold text-green-400 mb-2 animate-pulse">
                ${(mockData.tvl / 1000000).toFixed(0)}M
              </div>
              <div className="text-gray-300">Total Value Locked</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-ibm-plex-mono font-bold text-blue-400 mb-2 animate-pulse">
                {mockData.averageAPY}%
              </div>
              <div className="text-gray-300">Average APY</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-ibm-plex-mono font-bold text-purple-400 mb-2 animate-pulse">
                5+
              </div>
              <div className="text-gray-300">Somnia Protocols</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-ibm-plex-mono font-bold text-yellow-400 mb-2 animate-pulse">
                24/7
              </div>
              <div className="text-gray-300">AI Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Protocols Section */}
      <section className="py-20 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-space-grotesk text-4xl font-bold text-white mb-4">
              Powered by Somnia's Best Protocols
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our AI automatically allocates your funds across Somnia's top-performing DeFi protocols
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Standard Protocol', apy: '12%', risk: 'Low', desc: 'On-chain CLOB with spot/perpetual trading' },
              { name: 'QuickSwap', apy: '18%', risk: 'Medium', desc: 'DEX with swaps, LP staking, and yield farming' },
              { name: 'Haifu.fun', apy: '25%', risk: 'High', desc: 'AI-powered autonomous trading agents' },
              { name: 'Salt Treasury', apy: '8%', risk: 'Very Low', desc: 'Self-custodial treasury coordination' },
              { name: 'Somnia Staking', apy: '15%', risk: 'Very Low', desc: 'Native SOMI token staking rewards' },
            ].map((protocol, index) => (
              <GlowCard key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-space-grotesk text-lg font-bold text-white">{protocol.name}</h3>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">{protocol.apy}</div>
                    <div className="text-xs text-gray-400">{protocol.risk} Risk</div>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{protocol.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Tier Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-space-grotesk text-4xl font-bold text-white mb-4">
              Choose Your Investment Tier
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Stake MIND tokens to unlock enhanced features and higher deposit limits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                tier: 'Free',
                mindRequired: '0 MIND',
                depositLimit: '$10,000',
                rebalanceFreq: '24 hours',
                features: ['Basic AI optimization', 'Standard protocols', 'Community support'],
                color: 'from-gray-400 to-gray-600'
              },
              {
                tier: 'Premium',
                mindRequired: '100 MIND',
                depositLimit: '$100,000',
                rebalanceFreq: '4 hours',
                features: ['Advanced AI strategies', 'Priority protocol access', 'Premium support', 'Higher APY opportunities'],
                color: 'from-blue-400 to-blue-600'
              },
              {
                tier: 'Pro',
                mindRequired: '500 MIND',
                depositLimit: '$1,000,000',
                rebalanceFreq: '1 hour',
                features: ['Maximum AI optimization', 'Exclusive protocols', 'Dedicated support', 'Custom strategies', 'Early access features'],
                color: 'from-green-400 to-green-600'
              }
            ].map((tier, index) => (
              <GlowCard key={index} className="p-8 relative">
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4`}>
                    {tier.tier[0]}
                  </div>
                  <h3 className="font-space-grotesk text-2xl font-bold text-white mb-2">{tier.tier}</h3>
                  <div className="text-gray-400 mb-4">{tier.mindRequired}</div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Deposit Limit:</span>
                    <span className="text-white font-semibold">{tier.depositLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Rebalance:</span>
                    <span className="text-white font-semibold">{tier.rebalanceFreq}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {tier.tier !== 'Free' && (
                  <div className="mt-6">
                    <Link href="/staking">
                      <button className={`w-full py-3 bg-gradient-to-r ${tier.color} text-white rounded-xl font-space-grotesk font-semibold hover:scale-105 transition-transform`}>
                        Stake {tier.mindRequired}
                      </button>
                    </Link>
                  </div>
                )}
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-slate-800/30 to-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-space-grotesk text-4xl font-bold text-white mb-4">
              Why Choose YieldMind?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Advanced AI technology meets Somnia's DeFi ecosystem to deliver superior returns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Optimization',
                description: 'Advanced machine learning algorithms continuously analyze Somnia protocols to maximize your yields while managing risk.',
              },
              {
                icon: Target,
                title: 'Risk-Adjusted Strategies',
                description: 'Our AI calculates risk-adjusted scores for each protocol, ensuring optimal portfolio allocation based on your risk tolerance.',
              },
              {
                icon: Zap,
                title: 'Real-Time Rebalancing',
                description: 'Automatic portfolio rebalancing based on your tier - from 24 hours (Free) to 1 hour (Pro) for maximum optimization.',
              },
              {
                icon: Shield,
                title: 'Secure & Transparent',
                description: 'Non-custodial platform with open-source smart contracts. Your keys, your funds, your control.',
              },
              {
                icon: Users,
                title: 'Tier-Based Benefits',
                description: 'Stake MIND tokens to unlock Premium and Pro tiers with higher limits, faster rebalancing, and exclusive features.',
              },
              {
                icon: BarChart3,
                title: 'Performance Analytics',
                description: 'Comprehensive dashboard with real-time performance metrics, APY tracking, and portfolio insights.',
              },
            ].map((feature, index) => (
              <div key={index}>
                <GlowCard className="p-6 h-full">
                  <feature.icon className="w-12 h-12 text-green-400 mb-4 animate-pulse" />
                  <h3 className="font-space-grotesk text-xl font-bold text-white mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 font-inter">
                    {feature.description}
                  </p>
                </GlowCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-space-grotesk text-4xl font-bold text-white mb-4">
              How YieldMind Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our AI-driven approach ensures optimal returns across Somnia's DeFi ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  step: '01',
                  title: 'AI Protocol Analysis',
                  desc: 'Our AI continuously monitors Somnia protocols, analyzing APY, risk scores, and TVL to identify optimal opportunities.',
                  icon: Cpu
                },
                {
                  step: '02',
                  title: 'Risk-Adjusted Scoring',
                  desc: 'Each protocol receives a risk-adjusted score using our proprietary formula: (APY × 100) / √(Risk Score).',
                  icon: Target
                },
                {
                  step: '03',
                  title: 'Portfolio Optimization',
                  desc: 'Funds are automatically allocated across top-performing protocols based on your tier and risk preferences.',
                  icon: TrendingUp
                },
                {
                  step: '04',
                  title: 'Continuous Monitoring',
                  desc: '24/7 monitoring ensures your portfolio stays optimized with automatic rebalancing based on your tier.',
                  icon: Zap
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-space-grotesk text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-2xl p-8 backdrop-blur-sm border border-slate-600">
                <h3 className="font-space-grotesk text-xl font-bold text-white mb-6">AI Strategy Example</h3>
                <div className="space-y-4">
                  {[
                    { protocol: 'Somnia Staking', allocation: '40%', apy: '15%', risk: 'Very Low' },
                    { protocol: 'QuickSwap', allocation: '30%', apy: '18%', risk: 'Medium' },
                    { protocol: 'Standard Protocol', allocation: '20%', apy: '12%', risk: 'Low' },
                    { protocol: 'Haifu.fun', allocation: '10%', apy: '25%', risk: 'High' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div>
                        <div className="text-white font-semibold">{item.protocol}</div>
                        <div className="text-gray-400 text-sm">{item.apy} APY • {item.risk} Risk</div>
                      </div>
                      <div className="text-green-400 font-bold">{item.allocation}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-green-400/10 rounded-lg border border-green-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Expected Portfolio APY:</span>
                    <span className="text-green-400 font-bold text-lg">16.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-green-400/10 to-blue-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-space-grotesk text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Maximize Your{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Crypto Returns?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users already earning superior yields with YieldMind's AI-powered optimization on Somnia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/deposit">
                <GradientButton size="lg" className="w-full sm:w-auto">
                  Start Earning Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </GradientButton>
              </Link>
              <Link href="/dashboard">
                <button className="px-8 py-4 border border-slate-600 text-white rounded-xl font-space-grotesk font-semibold hover:border-green-400 transition-colors shadow-glow-card hover:scale-105">
                  View Live Dashboard
                </button>
              </Link>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-space-grotesk text-lg font-bold text-white mb-2">Non-Custodial</h3>
                <p className="text-gray-300 text-sm">Your keys, your funds, your control</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-space-grotesk text-lg font-bold text-white mb-2">Proven Results</h3>
                <p className="text-gray-300 text-sm">16.2% average portfolio APY</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-space-grotesk text-lg font-bold text-white mb-2">Low Fees</h3>
                <p className="text-gray-300 text-sm">Only 0.5% performance fee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-16 relative overflow-hidden">
        {/* Animated footer blob */}
        <div className="absolute left-1/2 bottom-[-120px] -translate-x-1/2 z-[-1] w-[350px] h-[350px] bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 opacity-20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <span className="font-space-grotesk font-bold text-3xl text-white tracking-tight drop-shadow-lg">YieldMind</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The future of DeFi investing is here. AI-powered yield optimization on Somnia blockchain for superior returns.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-green-400/20 transition-colors cursor-pointer">
                  <span className="text-green-400 font-bold">T</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-green-400/20 transition-colors cursor-pointer">
                  <span className="text-green-400 font-bold">D</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-green-400/20 transition-colors cursor-pointer">
                  <span className="text-green-400 font-bold">G</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-space-grotesk text-lg font-bold text-white mb-4">Platform</h3>
              <ul className="space-y-3">
                <li><Link href="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">Dashboard</Link></li>
                <li><Link href="/deposit" className="text-gray-400 hover:text-green-400 transition-colors">Deposit</Link></li>
                <li><Link href="/premium" className="text-gray-400 hover:text-green-400 transition-colors">Premium Staking</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-green-400 transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-space-grotesk text-lg font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><Link href="/docs" className="text-gray-400 hover:text-green-400 transition-colors">Documentation</Link></li>
                <li><Link href="/docs" className="text-gray-400 hover:text-green-400 transition-colors">Whitepaper</Link></li>
                <li><Link href="/docs" className="text-gray-400 hover:text-green-400 transition-colors">Security Audit</Link></li>
                <li><Link href="/support" className="text-gray-400 hover:text-green-400 transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">
                © 2024 YieldMind. All rights reserved. Built on Somnia blockchain.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400">
                <Link href="/docs" className="hover:text-green-400 transition-colors">Privacy Policy</Link>
                <Link href="/docs" className="hover:text-green-400 transition-colors">Terms of Service</Link>
                <Link href="/docs" className="hover:text-green-400 transition-colors">Risk Disclaimer</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}