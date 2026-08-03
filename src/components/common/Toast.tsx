import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Bell, ShoppingBag, Heart, Award, ArrowRight } from 'lucide-react';
import { useNotifications, type ToastMessage } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const ToastContainer: React.FC = () => {
  const { activeToasts, dismissToast } = useNotifications();
  const navigate = useNavigate();

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'order':
      case 'delivery':
        return <ShoppingBag className="text-amber-600 dark:text-amber-400" size={18} />;
      case 'price_drop':
      case 'back_in_stock':
        return <Heart className="text-red-500" size={18} />;
      case 'festival':
      case 'offer':
        return <Award className="text-amber-500" size={18} />;
      default:
        return <Bell className="text-stone-500" size={18} />;
    }
  };

  const handleToastClick = (toast: ToastMessage) => {
    dismissToast(toast.id);
    if (toast.link) {
      navigate(toast.link);
    }
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 max-w-sm w-full mx-auto sm:mx-0">
      <AnimatePresence>
        {activeToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-stone-200/50 dark:border-stone-800/30 flex items-start gap-3 cursor-pointer group"
            onClick={() => handleToastClick(toast)}
          >
            {/* Type Icon */}
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 flex-shrink-0">
              {getIcon(toast.type)}
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0 pr-2">
              <h4 className="font-sans font-bold text-sm text-stone-900 dark:text-stone-100 leading-tight">
                {toast.title}
              </h4>
              <p className="font-sans font-normal text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                {toast.body}
              </p>
              {toast.link && (
                <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-2 group-hover:underline">
                  <span>View Details</span>
                  <ArrowRight size={10} />
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.id);
              }}
              className="p-1 rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850 hover:text-stone-650 transition-colors flex-shrink-0 self-start"
              aria-label="Dismiss Notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
