import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, addDoc, query, where, updateDoc, onSnapshot } from 'firebase/firestore';
import type { Order } from '../types';

/**
 * Strips all undefined fields recursively so Firestore never throws unsupported field value error.
 */
function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestoreData) as unknown as T;
  }
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = typeof value === 'object' && value !== null
        ? cleanFirestoreData(value)
        : value;
    }
  }
  return cleaned as T;
}

export const OrderService = {
  async getOrders(userId: string): Promise<Order[]> {
    const colRef = collection(db, 'orders');
    const q = query(colRef, where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data,
        createdAt: data.createdAt || new Date().toISOString()
      } as Order;
    });
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const docRef = doc(db, 'orders', orderId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return { 
      id: snap.id, 
      ...data,
      createdAt: data.createdAt || new Date().toISOString()
    } as Order;
  },

  async createOrder(userId: string, orderData: Omit<Order, 'id' | 'userId' | 'createdAt'>): Promise<Order> {
    const colRef = collection(db, 'orders');
    const docData = {
      ...orderData,
      userId,
      createdAt: new Date().toISOString()
    };
    const sanitizedData = cleanFirestoreData(docData);
    const ref = await addDoc(colRef, sanitizedData);
    return { id: ref.id, ...sanitizedData } as Order;
  },

  async updateOrderStatus(orderId: string, status: Order['status'], trackingTimeline: Order['trackingTimeline']): Promise<void> {
    const docRef = doc(db, 'orders', orderId);
    const sanitizedTimeline = cleanFirestoreData(trackingTimeline);
    await updateDoc(docRef, { status, trackingTimeline: sanitizedTimeline });
  },

  subscribeOrders(userId: string, callback: (orders: Order[]) => void): () => void {
    const colRef = collection(db, 'orders');
    const q = query(colRef, where('userId', '==', userId));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString()
        } as Order;
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    }, (error) => {
      console.error("Error subscribing to orders:", error);
    });
  }
};

export type OrderServiceType = typeof OrderService;
