'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GlowCardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ className, glow = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={glow ? { y: -4 } : undefined}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative p-6 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden',
          'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-green-400/20 before:to-blue-500/10 before:blur-xl before:transition-opacity before:duration-300',
          'hover:-translate-y-1 hover:shadow-glow transition-transform duration-300',
          glow && 'shadow-glow',
          className
        )}
        {...props}
      >
        {glow && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-blue-500/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);

GlowCard.displayName = 'GlowCard';