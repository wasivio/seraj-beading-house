import React, { createContext, useContext, useEffect, useState } from 'react';
import type { CartItem, Product, Coupon } from '../types';
import { useAuth } from './AuthContext';
import { firebaseService } from '../services/firebaseService';

interface CartContextType {
  cartItems: CartItem[];
  savedForLater: CartItem[];
  appliedCoupon: Coupon | null;
  couponError: string | null;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, qty: number) => void;
  clearCart: () => void;
  saveForLater: (cartItemId: string) => void;
  moveToCart: (cartItemId: string) => void;
  removeFromSaved: (cartItemId: string) => void;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCouponCode: () => void;
  subtotal: number;
  shippingCharge: number;
  tax: number;
  discount: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const local = localStorage.getItem('siraj_cart');
    return local ? JSON.parse(local) : [];
  });

  const [savedForLater, setSavedForLater] = useState<CartItem[]>(() => {
    const local = localStorage.getItem('siraj_save_later');
    return local ? JSON.parse(local) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const local = localStorage.getItem('siraj_applied_coupon');
    return local ? JSON.parse(local) : null;
  });

  const [couponError, setCouponError] = useState<string | null>(null);

  // Sync state changes with local storage
  useEffect(() => {
    localStorage.setItem('siraj_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('siraj_save_later', JSON.stringify(savedForLater));
  }, [savedForLater]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('siraj_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('siraj_applied_coupon');
    }
  }, [appliedCoupon]);

  // Sync/Restore cart automatically after successful login
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // In a real application, we would fetch the user's remote cart from Firestore
      // and merge it with the local Guest Cart.
      // Rule 8: "Customer should never lose cart after login. Restore Cart automatically."
      // Since our local cart is stored in localStorage, it naturally persists.
      // We also save it to a simulated user database slot.
      const savedUserCart = localStorage.getItem(`siraj_cart_${currentUser.email}`);
      if (savedUserCart) {
        const remoteCart = JSON.parse(savedUserCart) as CartItem[];
        // Merge guest cart with user cart, matching product ids, sizes and colors
        setCartItems(prevGuestCart => {
          const merged = [...prevGuestCart];
          remoteCart.forEach(remoteItem => {
            const exists = merged.find(i => i.id === remoteItem.id);
            if (exists) {
              exists.quantity = Math.max(exists.quantity, remoteItem.quantity);
            } else {
              merged.push(remoteItem);
            }
          });
          return merged;
        });
      }
    }
  }, [isAuthenticated, currentUser]);

  // Keep a copy of the current cart saved under the user's specific key if logged in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem(`siraj_cart_${currentUser.email}`, JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated, currentUser]);

  const addToCart = (product: Product, quantity = 1, size = '', color = '') => {
    const selectedSize = size || (product.size.length > 0 ? product.size[0] : 'Standard');
    const selectedColor = color || (product.color.length > 0 ? product.color[0] : 'Default');
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;

    setCartItems(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { id: cartItemId, product, quantity, selectedSize, selectedColor }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === cartItemId ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const saveForLater = (cartItemId: string) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (item) {
      setCartItems(prev => prev.filter(i => i.id !== cartItemId));
      // Avoid duplicates in saved for later
      setSavedForLater(prev => {
        if (prev.some(i => i.id === cartItemId)) return prev;
        return [...prev, item];
      });
    }
  };

  const moveToCart = (cartItemId: string) => {
    const item = savedForLater.find(i => i.id === cartItemId);
    if (item) {
      setSavedForLater(prev => prev.filter(i => i.id !== cartItemId));
      setCartItems(prev => {
        const existing = prev.find(i => i.id === cartItemId);
        if (existing) {
          return prev.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + item.quantity } : i);
        }
        return [...prev, item];
      });
    }
  };

  const removeFromSaved = (cartItemId: string) => {
    setSavedForLater(prev => prev.filter(item => item.id !== cartItemId));
  };

  const applyCouponCode = async (code: string): Promise<boolean> => {
    setCouponError(null);
    try {
      const coupon = await firebaseService.firestore.validateCoupon(code, subtotal);
      setAppliedCoupon(coupon);
      return true;
    } catch (e: any) {
      setCouponError(e.message || 'Failed to apply coupon');
      return false;
    }
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Financial calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  const discount = appliedCoupon
    ? appliedCoupon.discountType === 'percentage'
      ? Math.round(subtotal * (appliedCoupon.value / 100))
      : appliedCoupon.value
    : 0;

  // Free shipping above ₹1000, otherwise flat ₹150. If cart is empty, shipping is 0
  const shippingCharge = subtotal === 0 ? 0 : subtotal > 1999 ? 0 : 150;
  
  // Simulated 18% GST included in grand total
  const tax = Math.round((subtotal - discount) * 0.18);
  const grandTotal = Math.max(0, subtotal - discount + shippingCharge + tax);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedForLater,
        appliedCoupon,
        couponError,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        saveForLater,
        moveToCart,
        removeFromSaved,
        applyCouponCode,
        removeCouponCode,
        subtotal,
        shippingCharge,
        tax,
        discount,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
