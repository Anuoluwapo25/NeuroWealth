'use client';

import { useState } from 'react';
import { MessageCircle, Mail, Phone, Clock, CheckCircle, Send } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { GlowCard } from '@/components/ui/glow-card';
import { Navbar } from '@/components/layout/navbar';

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Support form submitted:', formData);
  };

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: '24/7',
      responseTime: '< 5 minutes',
      color: 'text-green-400'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us detailed questions or issues',
      availability: '24/7',
      responseTime: '< 2 hours',
      color: 'text-blue-400'
    },
    {
      icon: Phone,
      title: 'Priority Support',
      description: 'Direct phone support for Pro tier users',
      availability: 'Business Hours',
      responseTime: '< 30 minutes',
      color: 'text-purple-400'
    }
  ];

  const faqs = [
    {
      question: 'How do I connect my wallet to the network?',
      answer: 'Go to your wallet settings and add the network with the appropriate RPC URL and Chain ID'
    },
    {
      question: 'Why is my transaction failing?',
      answer: 'Common causes include insufficient gas, network congestion, or incorrect network. Make sure you\'re on the correct network and have enough native tokens for gas.'
    },
    {
      question: 'How do I upgrade my tier?',
      answer: 'Stake MIND tokens: 100 MIND for Premium tier, 500 MIND for Pro tier. Visit the staking page to upgrade.'
    },
    {
      question: 'When will I see my rewards?',
      answer: 'Rewards are calculated continuously and distributed based on your tier\'s rebalancing frequency.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <h1 className="font-space-grotesk text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Support</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We&apos;re here to help you maximize your DeFi returns
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {supportChannels.map((channel, index) => (
            <GlowCard key={index} className="p-6 text-center">
              <channel.icon className={`w-12 h-12 ${channel.color} mx-auto mb-4`} />
              <h3 className="font-space-grotesk text-xl font-bold text-white mb-3">
                {channel.title}
              </h3>
              <p className="text-gray-300 mb-4">{channel.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Available:</span>
                  <span className="text-white">{channel.availability}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Response:</span>
                  <span className="text-green-400">{channel.responseTime}</span>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <GlowCard className="p-8">
              <h2 className="font-space-grotesk text-2xl font-bold text-white mb-6">
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
                    placeholder="What can we help you with?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-green-400 focus:outline-none resize-none"
                    placeholder="Please describe your issue or question in detail..."
                    required
                  />
                </div>
                
                <GradientButton type="submit" size="lg" className="w-full">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </GradientButton>
              </form>
            </GlowCard>
          </div>

          {/* FAQ */}
          <div>
            <GlowCard className="p-8">
              <h2 className="font-space-grotesk text-2xl font-bold text-white mb-6">
                Common Questions
              </h2>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-slate-700 pb-4">
                    <h3 className="font-space-grotesk text-lg font-bold text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-300">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </GlowCard>
          </div>
        </div>

        {/* Status Page */}
        <div className="mt-16">
          <GlowCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-space-grotesk text-2xl font-bold text-white">
                System Status
              </h2>
              <div className="flex items-center text-green-400">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                All Systems Operational
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { service: 'Smart Contracts', status: 'Operational', uptime: '99.9%' },
                { service: 'AI Strategy Engine', status: 'Operational', uptime: '99.8%' },
                { service: 'Network', status: 'Operational', uptime: '99.7%' },
                { service: 'Frontend Dashboard', status: 'Operational', uptime: '99.9%' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-white font-semibold mb-1">{item.service}</div>
                  <div className="text-green-400 text-sm mb-1">{item.status}</div>
                  <div className="text-gray-400 text-xs">{item.uptime} uptime</div>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
