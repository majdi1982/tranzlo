'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className={cn(
            "fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] flex min-w-[300px] items-center gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md",
            type === 'success' && "border-emerald-500/20 bg-emerald-50/90 text-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-100",
            type === 'error' && "border-red-500/20 bg-red-50/90 text-red-900 dark:bg-red-950/90 dark:text-red-100",
            type === 'info' && "border-blue-500/20 bg-blue-50/90 text-blue-900 dark:bg-blue-950/90 dark:text-blue-100"
          )}
        >
          <div className="shrink-0">
            {type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            {type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
            {type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
          </div>
          
          <p className="flex-1 text-sm font-semibold">{message}</p>
          
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4 opacity-50 hover:opacity-100" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manage toast state
 */
export function useToast() {
  const [toast, setToast] = React.useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = React.useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type, isVisible: true });
  }, []);

  const hideToast = React.useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  return { toast, showToast, hideToast };
}
