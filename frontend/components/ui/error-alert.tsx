'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface ErrorAlertProps {
  title: string;
  message: string;
  suggestion?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  variant?: 'error' | 'warning';
}

export const ErrorAlert = ({ 
  title, 
  message, 
  suggestion, 
  onRetry, 
  retryText = 'Try Again',
  className,
  variant = 'error'
}: ErrorAlertProps) => {
  const isError = variant === 'error';
  
  return (
    <div className={cn(
      'p-4 rounded-xl border',
      isError 
        ? 'bg-red-400/10 border-red-400/20 text-red-400' 
        : 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
      className
    )}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm mb-2">{message}</p>
          {suggestion && (
            <p className="text-xs opacity-75 mb-3">{suggestion}</p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity"
            >
              <RefreshCw className="w-3 h-3" />
              {retryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
