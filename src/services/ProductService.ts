import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where, addDoc } from 'firebase/firestore';
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

  async seedDatabaseIfNeeded() {
    // Seeder disabled. We show only actual items present in Firestore.
    return;
  }
};
export type ProductServiceType = typeof ProductService;
