import React from 'react';
import { Bell, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const NotificationPromptModal: React.FC = () => {
  const { showPermissionPrompt, setShowPermissionPrompt, requestNotificationPermission } = useNotifications();

  if (!showPermissionPrompt) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('siraj_notif_prompt_dismissed', 'true');
    setShowPermissionPrompt(false);
  };

  const handleAllow = async () => {
    await requestNotificationPermission();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 border border-amber-700/30 dark:border-amber-500/30 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative flex flex-col items-center text-center gap-4 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Glowing Bell Icon */}
        <div className="relative mt-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-600/30 animate-pulse">
            <Bell size={30} />
          </div>
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-stone-900">
            <Sparkles size={12} />
          </span>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400">
            Real-Time Updates
          </span>
          <h3 className="font-sans font-extrabold text-xl sm:text-2xl text-stone-900 dark:text-stone-100">
            Enable Notifications
          </h3>
          <p className="font-sans text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm">
            Stay informed with real-time order tracking, festival flash discounts, and new collection launches from Siraj Bedding House.
          </p>
        </div>

        {/* Feature points */}
        <div className="w-full bg-stone-50 dark:bg-stone-950 rounded-2xl p-3 text-left flex flex-col gap-2 border border-stone-200/50 dark:border-stone-800 text-[11px]">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
            <span>Instant order confirmation and delivery status alerts</span>
          </div>
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <CheckCircle2 size={14} className="text-amber-600 flex-shrink-0" />
            <span>Exclusive flash sales and festival discount coupons</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row w-full gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleAllow}
            className="flex-1 bg-luxury-gold hover:opacity-95 active:scale-[0.98] py-3 px-5 rounded-xl font-sans font-bold text-xs sm:text-sm text-stone-100 shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Bell size={16} />
            <span>Allow Notifications</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="py-3 px-4 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-sans font-semibold text-xs transition-colors cursor-pointer"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
};
