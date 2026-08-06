import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, setDoc, query, where, addDoc } from 'firebase/firestore';
import type { Product, Review, Coupon } from '../types';
import { MOCK_PRODUCTS, MOCK_REVIEWS, MOCK_COUPONS } from '../utils/mockData';

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
    try {
      const prodColRef = collection(db, 'products');
      const prodSnap = await getDocs(prodColRef);
      if (prodSnap.empty) {
        console.log('Seeding products, reviews, and coupons to Firestore...');
        
        for (const p of MOCK_PRODUCTS) {
          await setDoc(doc(db, 'products', p.id), p);
        }

        for (const r of MOCK_REVIEWS) {
          await setDoc(doc(db, 'reviews', r.id), r);
        }

        for (const c of MOCK_COUPONS) {
          await setDoc(doc(db, 'coupons', c.code), c);
        }

        await setDoc(doc(db, 'settings', 'system'), { seeded: true });

        console.log('Firestore seeded successfully!');
      }
    } catch (err) {
      console.warn('Database seeding skipped or failed. This is expected if the database is already seeded or if permissions are restricted.', err);
    }
  }
};
export type ProductServiceType = typeof ProductService;
