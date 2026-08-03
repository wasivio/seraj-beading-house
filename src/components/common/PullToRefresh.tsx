import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const PULL_THRESHOLD = 70; // px

  const handleTouchStart = (e: TouchEvent) => {
    // Only pull if we are at the very top of the page
    if (window.scrollY === 0 && !isRefreshing) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply rubber band resistance formula
      const resistance = 0.4;
      const distance = Math.min(diff * resistance, PULL_THRESHOLD * 1.5);
      setPullDistance(distance);
      
      // Prevent browser default pull-to-refresh
      if (e.cancelable) e.preventDefault();
    } else {
      isPulling.current = false;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      
      try {
        await onRefresh();
      } catch (err) {
        console.error('Refresh failed', err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const el = window;
    el.addEventListener('touchstart', handleTouchStart as any, { passive: true });
    el.addEventListener('touchmove', handleTouchMove as any, { passive: false });
    el.addEventListener('touchend', handleTouchEnd as any, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart as any);
      el.removeEventListener('touchmove', handleTouchMove as any);
      el.removeEventListener('touchend', handleTouchEnd as any);
    };
  }, [pullDistance, isRefreshing]);

  return (
    <div className="relative w-full">
      {/* Animated pull-down indicator */}
      <motion.div
        style={{ height: pullDistance }}
        className="overflow-hidden flex items-center justify-center bg-stone-100 dark:bg-stone-900 border-b border-stone-200/20 w-full"
        animate={{ height: pullDistance }}
        transition={isPulling.current ? { duration: 0 } : { type: 'spring', damping: 20, stiffness: 200 }}
      >
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <Loader2 
            size={18} 
            className={`animate-spin ${pullDistance >= PULL_THRESHOLD ? 'text-amber-700 dark:text-amber-400' : 'text-stone-400'}`} 
          />
          <span className="text-[11px] font-sans font-medium">
            {isRefreshing 
              ? 'Refreshing...' 
              : pullDistance >= PULL_THRESHOLD 
                ? 'Release to refresh' 
                : 'Pull down to refresh'}
          </span>
        </div>
      </motion.div>
      
      {/* Content wrapper */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
