'use client';

import { cn } from '@/lib/utils';

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  children: React.ReactNode;
}

export const GlowCard = ({ className, glow = true, children, ...props }: GlowCardProps) => {
  return (
    <div
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
    </div>
  );
};