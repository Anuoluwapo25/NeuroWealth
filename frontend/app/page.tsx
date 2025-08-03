'use client';

import { TrendingUp, Zap, Shield, Globe } from 'lucide-react';
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
              Maximize Your{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Crypto Earnings
              </span>{' '}
              with AI
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Advanced AI algorithms continuously optimize your DeFi investments across multiple chains, 
              maximizing yields while managing risk automatically.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {/* Animated gradient blob */}
              <div className="absolute left-1/2 top-[-80px] -translate-x-1/2 z-[-1] w-[400px] h-[400px] bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 opacity-30 rounded-full blur-3xl animate-pulse-slow" />
              <Link href="/deposit">
                <GradientButton size="lg" className="w-full sm:w-auto">
                  Connect Wallet & Start
                </GradientButton>
              </Link>
              <Link href="/dashboard">
                <button className="px-8 py-4 border border-slate-600 text-white rounded-xl font-space-grotesk font-semibold hover:border-green-400 transition-colors shadow-glow-card hover:scale-105">
                  View Demo
                </button>
              </Link>
            </div>

            {/* Process Flow */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { step: '1', title: 'Deposit', desc: 'Connect wallet & deposit stablecoins' },
                { step: '2', title: 'AI Scans', desc: 'AI analyzes best yield opportunities' },
                { step: '3', title: 'Auto-Deploy', desc: 'Funds deployed across chains' },
                { step: '4', title: 'Earn', desc: 'Watch your portfolio grow' },
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="text-center"
            >
              <div className="text-4xl font-ibm-plex-mono font-bold text-green-400 mb-2 animate-pulse">
                ${(mockData.tvl / 1000000).toFixed(0)}M
              </div>
              <div className="text-gray-300">Total Value Locked</div>
            </div>
            
            <div
              className="text-center"
            >
              <div className="text-4xl font-ibm-plex-mono font-bold text-blue-400 mb-2 animate-pulse">
                {mockData.averageAPY}%
              </div>
              <div className="text-gray-300">Average APY</div>
            </div>
            
            <div
              className="text-center"
            >
              <div className="text-4xl font-ibm-plex-mono font-bold text-purple-400 mb-2 animate-pulse">
                {mockData.supportedChains}
              </div>
              <div className="text-gray-300">Supported Chains</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center mb-16"
          >
            <h2 className="font-space-grotesk text-4xl font-bold text-white mb-4">
              Why Choose YieldMind?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Cutting-edge AI technology meets DeFi to deliver superior returns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'AI-Optimized Returns',
                description: 'Machine learning algorithms analyze thousands of opportunities to maximize your yields.',
              },
              {
                icon: Globe,
                title: 'Cross-Chain Deployment',
                description: 'Access the best opportunities across Ethereum, Polygon, Arbitrum, and more.',
              },
              {
                icon: Shield,
                title: 'Risk Management',
                description: 'Sophisticated risk assessment and portfolio rebalancing to protect your capital.',
              },
              {
                icon: Zap,
                title: 'Real-Time Optimization',
                description: 'Continuous monitoring and rebalancing ensures optimal performance 24/7.',
              },
            ].map((feature, index) => (
              <div
                key={index}
              >
                <GlowCard>
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

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 relative overflow-hidden">
        {/* Animated footer blob */}
        <div className="absolute left-1/2 bottom-[-120px] -translate-x-1/2 z-[-1] w-[350px] h-[350px] bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 opacity-20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <span className="font-space-grotesk font-bold text-2xl text-white tracking-tight drop-shadow-lg">YieldMind</span>
          </div>
          <p className="text-gray-400">
            © 2024 YieldMind. Maximizing your crypto potential with AI.
          </p>
        </div>
      </footer>
    </div>
  );
}