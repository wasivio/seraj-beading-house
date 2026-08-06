import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { CartItem } from '../types';

export const CartService = {
  async getCart(userId: string): Promise<CartItem[]> {
    const docRef = doc(db, 'cart', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return [];
    return snap.data().items || [];
  },

  async saveCart(userId: string, items: CartItem[]): Promise<void> {
    const docRef = doc(db, 'cart', userId);
    await setDoc(docRef, { items });
  },

  async mergeLocalCart(userId: string, localItems: CartItem[]): Promise<CartItem[]> {
    const dbItems = await this.getCart(userId);
    if (localItems.length === 0) return dbItems;

    const merged = [...dbItems];

    for (const local of localItems) {
      const existingIdx = merged.findIndex(
        item => 
          item.product.id === local.product.id && 
          item.selectedSize === local.selectedSize && 
          item.selectedColor === local.selectedColor
      );

      if (existingIdx > -1) {
        merged[existingIdx].quantity = Math.max(merged[existingIdx].quantity, local.quantity);
      } else {
        merged.push(local);
      }
    }

    await this.saveCart(userId, merged);
    return merged;
  }
};
export type CartServiceType = typeof CartService;
