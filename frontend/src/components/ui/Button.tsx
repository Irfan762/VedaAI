import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
          {
            // Variants
            'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/10': variant === 'primary',
            'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100': variant === 'secondary',
            'border border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-300': variant === 'outline',
            'hover:bg-slate-50 text-slate-600 dark:hover:bg-slate-900 dark:text-slate-400': variant === 'ghost',
            'bg-red-600 hover:bg-red-500 text-white shadow-sm': variant === 'danger',
            
            // Sizes
            'h-8.5 px-3 text-xs': size === 'sm',
            'h-10 px-5 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4.5 w-4.5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
