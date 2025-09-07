'use client';

import { BookOpen, FileText, Code, Shield, Users, Zap } from 'lucide-react';
import { GlowCard } from '@/components/ui/glow-card';
import { Navbar } from '@/components/layout/navbar';

export default function DocsPage() {
  const sections = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn the basics of YieldMind and how to start earning',
      topics: ['Introduction to YieldMind', 'Wallet Setup', 'First Deposit', 'Understanding Tiers']
    },
    {
      icon: Zap,
      title: 'AI Strategy',
      description: 'Understand how our AI optimizes your portfolio',
      topics: ['Risk-Adjusted Scoring', 'Protocol Selection', 'Rebalancing Logic', 'Performance Metrics']
    },
    {
      icon: Code,
      title: 'Smart Contracts',
      description: 'Technical documentation for developers',
      topics: ['Contract Architecture', 'ABI Reference', 'Integration Guide', 'Security Audit']
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Security measures and best practices',
      topics: ['Non-Custodial Design', 'Audit Reports', 'Risk Management', 'Emergency Procedures']
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join our community and get support',
      topics: ['Discord Server', 'Telegram Group', 'GitHub Repository', 'Support Channels']
    },
    {
      icon: FileText,
      title: 'Legal',
      description: 'Terms, privacy policy, and disclaimers',
      topics: ['Terms of Service', 'Privacy Policy', 'Risk Disclaimer', 'Compliance']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <h1 className="font-space-grotesk text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Documentation</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about YieldMind&apos;s AI-powered DeFi platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <GlowCard key={index} className="p-6 h-full">
              <section.icon className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="font-space-grotesk text-xl font-bold text-white mb-3">
                {section.title}
              </h3>
              <p className="text-gray-300 mb-4">
                {section.description}
              </p>
              <ul className="space-y-2">
                {section.topics.map((topic, topicIndex) => (
                  <li key={topicIndex} className="text-gray-400 text-sm hover:text-green-400 transition-colors cursor-pointer">
                    • {topic}
                  </li>
                ))}
              </ul>
            </GlowCard>
          ))}
        </div>

        {/* Quick Start Guide */}
        <div className="mt-20">
          <GlowCard className="p-8">
            <h2 className="font-space-grotesk text-3xl font-bold text-white mb-6 text-center">
              Quick Start Guide
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Connect Wallet', desc: 'Connect your wallet to Somnia network' },
                { step: '2', title: 'Deposit Funds', desc: 'Deposit  STT tokens' },
                { step: '3', title: 'Stake MIND', desc: 'Optional: Stake MIND for premium features' },
                { step: '4', title: 'Earn Rewards', desc: 'Watch your portfolio grow automatically' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-space-grotesk text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="font-space-grotesk text-3xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                question: 'How does YieldMind\'s AI work?',
                answer: 'Our AI continuously monitors Somnia protocols, analyzing APY, risk scores, and TVL to identify optimal opportunities. It uses a proprietary risk-adjusted scoring formula to allocate funds across the best-performing protocols.'
              },
              {
                question: 'What tokens can I deposit?',
                answer: 'You can deposit STT tokens. All deposits are automatically optimized across Somnia\'s DeFi ecosystem.'
              },
              {
                question: 'How often does rebalancing occur?',
                answer: 'Rebalancing frequency depends on your tier: Free (24 hours), Premium (4 hours), Pro (1 hour). Higher tiers get more frequent optimization for better returns.'
              },
              {
                question: 'Is YieldMind secure?',
                answer: 'Yes, YieldMind is non-custodial, meaning you maintain control of your funds. Our smart contracts are audited and open-source for transparency.'
              },
              {
                question: 'What are the fees?',
                answer: 'YieldMind charges a 0.5% performance fee only on profits earned. There are no deposit or withdrawal fees.'
              }
            ].map((faq, index) => (
              <GlowCard key={index} className="p-6">
                <h3 className="font-space-grotesk text-lg font-bold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
