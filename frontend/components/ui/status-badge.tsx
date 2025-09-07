'use client';

import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'error' | 'pending' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge = ({ status, children, className }: StatusBadgeProps) => {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      className: 'bg-green-400/10 text-green-400 border-green-400/20',
      iconClassName: 'text-green-400'
    },
    error: {
      icon: XCircle,
      className: 'bg-red-400/10 text-red-400 border-red-400/20',
      iconClassName: 'text-red-400'
    },
    pending: {
      icon: Clock,
      className: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
      iconClassName: 'text-yellow-400'
    },
    warning: {
      icon: AlertCircle,
      className: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
      iconClassName: 'text-orange-400'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium',
      config.className,
      className
    )}>
      <Icon className={cn('w-4 h-4', config.iconClassName)} />
      {children}
    </div>
  );
};
