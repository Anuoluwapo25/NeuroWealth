'use client';

import { motion } from 'framer-motion';
import { Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { GlowCard } from '@/components/ui/glow-card';

interface RebalanceEvent {
  timestamp: number;
  action: string;
  amount: number;
  fromProtocol?: string;
  toProtocol?: string;
  gasCost?: number;
}

interface RebalanceHistoryProps {
  events: RebalanceEvent[];
}

export function RebalanceHistory({ events }: RebalanceHistoryProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <GlowCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-space-grotesk text-2xl font-bold text-white flex items-center tracking-tight">
          <TrendingUp className="w-6 h-6 mr-2 text-green-400 animate-pulse" />
          AI Rebalancing History
        </h3>
        <span className="text-sm text-gray-400">Last 7 days</span>
      </div>

      <div className="space-y-4">
        {events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-xl border-2 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 shadow-glow-card hover:scale-[1.02] hover:shadow-glow-card transition-transform duration-200 border-green-400/40"
            style={{ borderImage: 'linear-gradient(90deg, #34d399 0%, #60a5fa 100%) 1' }}
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-400/20 rounded-lg">
                <Clock className="w-4 h-4 text-green-400" />
              </div>
              
              <div>
                <p className="font-space-grotesk text-lg font-semibold text-white tracking-tight">{event.action}</p>
                <p className="text-xs text-slate-400 font-inter">{formatDate(event.timestamp)}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-ibm-plex-mono text-lg text-green-400 font-bold">{formatCurrency(event.amount)}</p>
              {event.gasCost && (
                <p className="text-xs text-blue-400 font-inter">Gas: ${event.gasCost.toFixed(2)}</p>
              )}
            </div>

            {event.fromProtocol && event.toProtocol && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{event.fromProtocol}</span>
                <ArrowRight className="w-3 h-3" />
                <span>{event.toProtocol}</span>
              </div>
            )}
          </motion.div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No rebalancing events yet</p>
            <p className="text-sm text-gray-500 mt-1">
              AI will optimize your portfolio as opportunities arise
            </p>
          </div>
        )}
      </div>
    </GlowCard>
  );
}