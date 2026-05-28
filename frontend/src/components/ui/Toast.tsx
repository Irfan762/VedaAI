import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { clsx } from 'clsx';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', duration = 4000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center p-4 min-w-[320px] max-w-md rounded-xl shadow-premium border bg-white dark:bg-slate-900 animate-slide-in duration-300 toast-container">
      <div className="flex items-start gap-3 w-full">
        {/* Icons */}
        <div className="flex-shrink-0 mt-0.5">
          {type === 'success' && <CheckCircle2 className="h-5.5 w-5.5 text-emerald-500" />}
          {type === 'error' && <AlertCircle className="h-5.5 w-5.5 text-rose-500" />}
          {type === 'info' && <Info className="h-5.5 w-5.5 text-indigo-500" />}
        </div>
        
        {/* Message */}
        <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
          {message}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
