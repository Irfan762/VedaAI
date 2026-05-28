import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'outline';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, variant = 'default', hoverable = false, children, ...props }) => {
  return (
    <div
      className={clsx(
        'rounded-xl transition-all duration-300',
        {
          'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-glass': variant === 'default',
          'glass-card': variant === 'glass',
          'border border-slate-200 dark:border-slate-800': variant === 'outline',
          'hover:shadow-glass-hover hover:-translate-y-0.5': hoverable,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
