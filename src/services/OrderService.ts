import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, addDoc, query, where, updateDoc } from 'firebase/firestore';
import type { Order } from '../types';

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
    const ref = await addDoc(colRef, docData);
    return { id: ref.id, ...docData } as Order;
  },

  async updateOrderStatus(orderId: string, status: Order['status'], trackingTimeline: Order['trackingTimeline']): Promise<void> {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { status, trackingTimeline });
  }
};
export type OrderServiceType = typeof OrderService;
