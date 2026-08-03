import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user previously dismissed this session
      const dismissed = sessionStorage.getItem('siraj_pwa_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    } else {
      console.log('User dismissed the PWA install prompt');
    }
    
    // Clear prompt
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('siraj_pwa_dismissed', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-16 sm:bottom-6 left-0 right-0 sm:left-auto sm:right-6 z-40 px-4 sm:px-0 max-w-sm w-full mx-auto"
        >
          <div className="bg-gradient-to-br from-stone-900 to-stone-950 text-stone-100 rounded-3xl p-5 shadow-2xl border border-stone-850 flex flex-col gap-4 relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-700/20 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full text-stone-400 hover:bg-stone-850 hover:text-stone-100 transition-colors"
              aria-label="Dismiss Install Prompt"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo.jpg" 
                alt="Siraj Bedding House" 
                className="w-10 h-10 rounded-xl object-cover border border-amber-800/35 flex-shrink-0"
              />
              <div>
                <h4 className="font-sans font-bold text-sm text-stone-100">
                  Install Siraj Bedding App
                </h4>
                <p className="font-sans text-[11px] text-stone-400 mt-0.5">
                  Enjoy faster checkout and offline support.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={handleInstallClick}
                className="flex-grow bg-luxury-gold hover:opacity-90 active:scale-[0.98] text-stone-100 font-sans font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <Download size={14} />
                <span>Install Now</span>
              </button>
              <button
                onClick={handleDismiss}
                className="bg-stone-850 hover:bg-stone-800 active:scale-[0.98] text-stone-300 font-sans text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
              >
                Not Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
