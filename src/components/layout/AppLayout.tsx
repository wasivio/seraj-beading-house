import React, { useState } from 'react';
import { Header } from '../common/Header';
import { BottomNav } from '../common/BottomNav';
import { ToastContainer } from '../common/Toast';
import { PWAInstallPrompt } from '../common/PWAInstallPrompt';
import { ScrollToTop } from '../common/ScrollToTop';
import { SearchModal } from '../common/SearchModal';
import { PullToRefresh } from '../common/PullToRefresh';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleGlobalRefresh = async () => {
    // Simulate refreshing data
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Trigger standard reload hooks or custom notifications
    window.dispatchEvent(new Event('app_refresh_trigger'));
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col transition-colors duration-300 pb-16 sm:pb-0">
      
      {/* Header Bar */}
      <Header onSearchOpen={() => setIsSearchOpen(true)} />

      {/* Global Toast Alerts */}
      <ToastContainer />

      {/* Instant Search Drawer */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile-first Pull To Refresh wrapper */}
      <PullToRefresh onRefresh={handleGlobalRefresh}>
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6">
          {children}
        </main>
      </PullToRefresh>

      {/* Desktop/Tablet Footer Section (Home Page also details this, but we keep basic here or in home) */}
      
      {/* Sticky Bottom Nav on Mobile */}
      <BottomNav />

      {/* PWA Install Promo Drawer */}
      <PWAInstallPrompt />

      {/* Floating Scroll To Top button */}
      <ScrollToTop />
    </div>
  );
};
