import { 
  collection, 
  doc
} from 'firebase/firestore';
import type {
  CollectionReference,
  DocumentReference,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

// Helper to get collection typed reference
export const getColRef = <T = DocumentData>(path: string): CollectionReference<T> => {
  return collection(db, path) as CollectionReference<T>;
};

// Helper to get document typed reference
export const getDocRef = <T = DocumentData>(path: string, id: string): DocumentReference<T> => {
  return doc(db, path, id) as DocumentReference<T>;
};

// Collection Names Enum/Constants
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BRANDS: 'brands',
  HERO_BANNERS: 'heroBanners',
  OFFERS: 'offers',
  CART: 'cart',
  WISHLIST: 'wishlist',
  ORDERS: 'orders',
  ADDRESSES: 'addresses',
  NOTIFICATIONS: 'notifications',
  REVIEWS: 'reviews',
  SETTINGS: 'settings'
} as const;
