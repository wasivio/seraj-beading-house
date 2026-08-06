import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Product } from '../types';

export const WishlistService = {
  async getWishlist(userId: string): Promise<Product[]> {
    const docRef = doc(db, 'wishlist', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return [];
    return snap.data().items || [];
  },

  async saveWishlist(userId: string, items: Product[]): Promise<void> {
    const docRef = doc(db, 'wishlist', userId);
    await setDoc(docRef, { items });
  },

  async syncLocalWishlist(userId: string, localItems: Product[]): Promise<Product[]> {
    const dbItems = await this.getWishlist(userId);
    if (localItems.length === 0) return dbItems;

    const merged = [...dbItems];
    for (const local of localItems) {
      if (!merged.some(item => item.id === local.id)) {
        merged.push(local);
      }
    }

    await this.saveWishlist(userId, merged);
    return merged;
  }
};
export type WishlistServiceType = typeof WishlistService;
