import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md'
}) => {
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/40 dark:bg-stone-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`w-full bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-3xl p-6 shadow-2xl relative z-10 ${widthClasses[maxWidth]} transition-all`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
              aria-label="Close Modal"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="mb-4 pr-6">
              <h3 className="font-sans font-bold text-lg text-stone-900 dark:text-stone-100 leading-tight">
                {title}
              </h3>
              {description && (
                <p className="font-sans text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Body Content */}
            <div className="font-sans text-sm text-stone-600 dark:text-stone-300">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
