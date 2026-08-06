import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Product } from '../types';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { auth } from '../firebase';
import { WishlistService } from '../services/WishlistService';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCartFromWishlist: (product: Product, size?: string, color?: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToCart } = useCart();
  const { currentUser, isAuthenticated } = useAuth();
  
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const local = localStorage.getItem('siraj_wishlist');
    return local ? JSON.parse(local) : [];
  });

  useEffect(() => {
    localStorage.setItem('siraj_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync wishlist from Firestore upon login
  useEffect(() => {
    const loadAndSyncWishlist = async () => {
      if (isAuthenticated && currentUser) {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const local = localStorage.getItem('siraj_wishlist');
        const localItems: Product[] = local ? JSON.parse(local) : [];

        try {
          const synced = await WishlistService.syncLocalWishlist(uid, localItems);
          setWishlist(synced);
        } catch (e) {
          console.error('Error syncing local wishlist with Firestore:', e);
        }
      }
    };
    loadAndSyncWishlist();
  }, [isAuthenticated, currentUser]);

  // Keep Firestore copy updated
  useEffect(() => {
    const syncToFirestore = async () => {
      if (isAuthenticated && currentUser) {
        const uid = auth.currentUser?.uid;
        if (uid) {
          await WishlistService.saveWishlist(uid, wishlist).catch(e => {
            console.error('Error saving wishlist to Firestore:', e);
          });
        }
      }
    };
    syncToFirestore();
  }, [wishlist, isAuthenticated, currentUser]);

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.some(item => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const moveToCartFromWishlist = (product: Product, size = '', color = '') => {
    addToCart(product, 1, size, color);
    removeFromWishlist(product.id);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        moveToCartFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
