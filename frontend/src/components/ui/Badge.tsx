import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'easy' | 'medium' | 'hard' | 'default' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors border',
        {
          'bg-slate-100 text-slate-800 border-slate-200/50 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700/50': variant === 'default',
          'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30': variant === 'easy',
          'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30': variant === 'medium',
          'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30': variant === 'hard',
          'border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300': variant === 'outline',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
