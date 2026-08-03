import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`bg-stone-200 dark:bg-stone-800 animate-pulse rounded ${className}`} />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/50 rounded-2xl p-3 flex flex-col gap-3">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="flex flex-col gap-1.5 px-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4.5 w-2/3" />
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const OrderCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-stone-850/50 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/50 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
        <div className="flex-grow flex flex-col gap-1.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-stone-100 dark:border-stone-800/50">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
};
