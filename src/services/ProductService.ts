import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import type { Product, Review, Coupon } from '../types';

export const ProductService = {
  async getProducts(): Promise<Product[]> {
    await this.seedDatabaseIfNeeded();
    const colRef = collection(db, 'products');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  },

  async getProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, 'products', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Product;
  },

  async getReviewsByProductId(productId: string): Promise<Review[]> {
    const colRef = collection(db, 'reviews');
    const q = query(colRef, where('productId', '==', productId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
  },

  async addReview(review: Omit<Review, 'id' | 'likes' | 'reported' | 'date'>): Promise<Review> {
    const colRef = collection(db, 'reviews');
    const docData = {
      ...review,
      likes: 0,
      reported: false,
      date: new Date().toISOString()
    };
    const ref = await addDoc(colRef, docData);
    return { id: ref.id, ...docData } as Review;
  },

  async getCoupons(): Promise<Coupon[]> {
    await this.seedDatabaseIfNeeded();
    const colRef = collection(db, 'coupons');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => d.data() as Coupon);
  },

  async validateCoupon(code: string, subtotal: number): Promise<Coupon | null> {
    const coupons = await this.getCoupons();
    const c = coupons.find(item => item.code.toUpperCase() === code.toUpperCase());
    if (!c) return null;
    
    if (subtotal < c.minPurchase) return null;

    const expiry = new Date(c.expiryDate);
    if (expiry < new Date()) return null;

    return c;
  },

  async getHeroBanners(): Promise<any[]> {
    const colRef = collection(db, 'heroBanners');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getCategories(): Promise<any[]> {
    const colRef = collection(db, 'categories');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getBrands(): Promise<any[]> {
    const colRef = collection(db, 'brands');
    const snap = await getDocs(colRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async seedDatabaseIfNeeded() {
    // Seeder disabled. We show only actual items present in Firestore.
    return;
  },

  async clearMockData(): Promise<void> {
    const prodCol = collection(db, 'products');
    const prodSnap = await getDocs(prodCol);
    for (const d of prodSnap.docs) {
      await deleteDoc(doc(db, 'products', d.id));
    }

    const reviewCol = collection(db, 'reviews');
    const reviewSnap = await getDocs(reviewCol);
    for (const d of reviewSnap.docs) {
      await deleteDoc(doc(db, 'reviews', d.id));
    }

    const couponCol = collection(db, 'coupons');
    const couponSnap = await getDocs(couponCol);
    for (const d of couponSnap.docs) {
      await deleteDoc(doc(db, 'coupons', d.id));
    }

    await deleteDoc(doc(db, 'settings', 'system')).catch(() => {});
  }
};
export type ProductServiceType = typeof ProductService;
