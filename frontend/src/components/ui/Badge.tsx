import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export const Badge = ({ children, variant = 'neutral', className }: BadgeProps) => {
  const variants = {
    success: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-950/40 text-amber-400 border-amber-500/30',
    error: 'bg-red-950/40 text-red-400 border-red-500/30',
    info: 'bg-blue-950/40 text-blue-400 border-blue-500/30',
    neutral: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/30',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
