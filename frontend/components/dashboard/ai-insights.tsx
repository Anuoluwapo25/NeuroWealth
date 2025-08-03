'use client';

import { motion } from 'framer-motion';
import { Brain, Target, Zap, Shield } from 'lucide-react';
import { GlowCard } from '@/components/ui/glow-card';

interface AIInsight {
  type: 'optimization' | 'risk' | 'opportunity' | 'warning';
  title: string;
  description: string;
  impact?: string;
  confidence?: number;
}

interface AIInsightsProps {
  insights: AIInsight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return <Target className="w-5 h-5 text-blue-400" />;
      case 'risk':
        return <Shield className="w-5 h-5 text-yellow-400" />;
      case 'opportunity':
        return <Zap className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <Shield className="w-5 h-5 text-red-400" />;
      default:
        return <Brain className="w-5 h-5 text-purple-400" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'optimization':
        return 'border-blue-400/20 bg-blue-400/5';
      case 'risk':
        return 'border-yellow-400/20 bg-yellow-400/5';
      case 'opportunity':
        return 'border-green-400/20 bg-green-400/5';
      case 'warning':
        return 'border-red-400/20 bg-red-400/5';
      default:
        return 'border-purple-400/20 bg-purple-400/5';
    }
  };

  return (
    <GlowCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-space-grotesk text-2xl font-bold text-white flex items-center tracking-tight">
          <Brain className="w-6 h-6 mr-2 text-purple-400 animate-pulse" />
          AI Insights
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live Analysis</span>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border-2 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 shadow-glow-card hover:scale-[1.02] transition-transform duration-200 ${getInsightColor(insight.type)}`}
            style={{ borderImage: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%) 1' }}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-space-grotesk text-lg font-semibold text-white tracking-tight">{insight.title}</h4>
                  {insight.confidence && (
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded text-gray-300">
                      {insight.confidence}% confidence
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-300 mb-2 font-inter">{insight.description}</p>
                
                {insight.impact && (
                  <div className="text-xs text-gray-400 bg-slate-800/50 px-2 py-1 rounded">
                    Expected impact: {insight.impact}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {insights.length === 0 && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">AI is analyzing your portfolio</p>
            <p className="text-sm text-gray-500 mt-1">
              Insights will appear as data becomes available
            </p>
          </div>
        )}
      </div>
    </GlowCard>
  );
}