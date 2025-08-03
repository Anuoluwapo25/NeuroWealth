'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

export const GradientButton = forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, size = 'md', variant = 'primary', children, disabled, ...props }, ref) => {
    const baseClasses = cn(
      'relative inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200',
      'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600',
      'text-white shadow-lg hover:shadow-xl',
      'focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg',
      {
        'px-4 py-2 text-sm': size === 'sm',
        'px-6 py-3 text-base': size === 'md',
        'px-8 py-4 text-lg': size === 'lg',
      },
      className
    );

    if (variant === 'secondary') {
      return (
        <motion.button
          ref={ref}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          className={cn(
            baseClasses,
            'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600'
          )}
          disabled={disabled}
          {...props}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={baseClasses}
        disabled={disabled}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg blur opacity-0 hover:opacity-20 transition-opacity duration-200" />
        <span className="relative">{children}</span>
      </motion.button>
    );
  }
);

GradientButton.displayName = 'GradientButton';