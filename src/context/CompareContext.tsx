import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Product[]>([]);

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem('siraj_compare_list');
    if (stored) {
      try {
        setCompareList(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing compare list', e);
      }
    }
  }, []);

  const addToCompare = (product: Product) => {
    if (compareList.some((p) => p.id === product.id)) return;
    if (compareList.length >= 4) {
      // Limit to 4 products for side-by-side comparison
      alert('You can compare a maximum of 4 products at a time.');
      return;
    }
    const updated = [...compareList, product];
    setCompareList(updated);
    localStorage.setItem('siraj_compare_list', JSON.stringify(updated));
  };

  const removeFromCompare = (productId: string) => {
    const updated = compareList.filter((p) => p.id !== productId);
    setCompareList(updated);
    localStorage.setItem('siraj_compare_list', JSON.stringify(updated));
  };

  const isInCompare = (productId: string) => {
    return compareList.some((p) => p.id === productId);
  };

  const clearCompare = () => {
    setCompareList([]);
    localStorage.removeItem('siraj_compare_list');
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
