import { AuthService } from '../services/AuthService';
import { ProductService } from '../services/ProductService';
import { OrderService } from '../services/OrderService';
import { AddressService } from '../services/AddressService';
import { NotificationService } from '../services/NotificationService';
import { auth } from '../firebase';
import type { Order, Address, Review } from '../types';

export const FirebaseRepository = {
  auth: {
    getCurrentUser() {
      const user = AuthService.getCurrentUser();
      if (!user) return null;
      return {
        uid: user.uid,
        name: user.displayName || 'Customer',
        email: user.email || '',
        phone: user.phoneNumber || '',
        photoURL: user.photoURL || ''
      };
    },

    onAuthStateChanged(callback: (user: any) => void) {
      return AuthService.onAuthStateChanged(async (user) => {
        if (!user) {
          callback(null);
        } else {
          // Fetch persistent Firestore profile to restore custom phone and displayName
          const firestoreProfile = await AuthService.getUserProfile(user.uid);
          callback({
            uid: user.uid,
            name: firestoreProfile?.displayName || user.displayName || 'Customer',
            email: firestoreProfile?.email || user.email || '',
            phone: firestoreProfile?.phone || user.phoneNumber || '',
            photoURL: firestoreProfile?.photoURL || user.photoURL || ''
          });
        }
      });
    },

    async registerWithPhonePassword(name: string, phone: string, pass: string) {
      return AuthService.registerWithPhonePassword(name, phone, pass);
    },

    async loginWithPhonePassword(phone: string, pass: string) {
      return AuthService.loginWithPhonePassword(phone, pass);
    },

    async changePassword(currentPass: string, newPass: string) {
      return AuthService.changePassword(currentPass, newPass);
    },

    async getUserProfile(userId: string) {
      return AuthService.getUserProfile(userId);
    },

    async updateUserProfile(userId: string, data: { name?: string; phone?: string; photoURL?: string }) {
      return AuthService.updateUserProfile(userId, data);
    },

    async logout() {
      await AuthService.logout();
    }
  },

  firestore: {
    getProducts() {
      return ProductService.getProducts();
    },
    getHeroBanners() {
      return ProductService.getHeroBanners();
    },
    getCategories() {
      return ProductService.getCategories();
    },
    getBrands() {
      return ProductService.getBrands();
    },
    getProductById(id: string) {
      return ProductService.getProductById(id);
    },

    getReviewsByProductId(productId: string) {
      return ProductService.getReviewsByProductId(productId);
    },
    addReview(review: Omit<Review, 'id' | 'likes' | 'reported' | 'date'>) {
      return ProductService.addReview(review);
    },

    getCoupons() {
      return ProductService.getCoupons();
    },
    validateCoupon(code: string, subtotal: number) {
      return ProductService.validateCoupon(code, subtotal);
    },
    clearMockData() {
      return ProductService.clearMockData();
    },

    async getAddresses() {
      const user = auth.currentUser;
      if (!user) return [];
      return AddressService.getAddresses(user.uid);
    },
    async saveAddress(address: Omit<Address, 'id'> & { id?: string }) {
      const user = auth.currentUser;
      if (!user) throw new Error('Auth required to save address');
      return AddressService.saveAddress(user.uid, address);
    },
    async deleteAddress(addressId: string) {
      const user = auth.currentUser;
      if (!user) throw new Error('Auth required to delete address');
      return AddressService.deleteAddress(user.uid, addressId);
    },

    async getOrders() {
      const user = auth.currentUser;
      if (!user) return [];
      return OrderService.getOrders(user.uid);
    },
    subscribeOrders(callback: (orders: Order[]) => void): () => void {
      const user = auth.currentUser;
      if (!user) {
        callback([]);
        return () => {};
      }
      return OrderService.subscribeOrders(user.uid, callback);
    },
    async getOrderById(orderId: string) {
      return OrderService.getOrderById(orderId);
    },
    async createOrder(orderData: Omit<Order, 'id' | 'userId' | 'createdAt'>) {
      const user = auth.currentUser;
      if (!user) throw new Error('Auth required to place order');
      return OrderService.createOrder(user.uid, orderData);
    },
    async simulateOrderStatusUpdate(orderId: string, status: Order['status']) {
      const order = await OrderService.getOrderById(orderId);
      if (!order) return;
      
      const newTimeline = [
        ...order.trackingTimeline,
        {
          status: status,
          title: status.toUpperCase(),
          description: `Your order status changed to ${status}.`,
          date: new Date().toISOString(),
          isCompleted: true
        }
      ];

      await OrderService.updateOrderStatus(orderId, status, newTimeline);
      window.dispatchEvent(new Event('order_status_sync'));
    }
  },

  fcm: {
    getFCMConfig() {
      return NotificationService.getFCMConfig();
    },
    saveFCMConfig(config: any) {
      return NotificationService.saveFCMConfig(config);
    },
    getNotificationHistory() {
      return NotificationService.getNotificationHistory();
    },
    getUnreadCount() {
      return NotificationService.getUnreadCount();
    },
    markAsRead(id: string) {
      return NotificationService.markAsRead(id);
    },
    markAllAsRead() {
      return NotificationService.markAllAsRead();
    },
    requestPermission() {
      return NotificationService.requestPermission();
    },
    subscribeToFirestoreNotifications(onUpdate: (notifs: any[]) => void) {
      return NotificationService.subscribeToFirestoreNotifications(onUpdate);
    },
    initForegroundMessaging(onMessageReceived: (notif: any) => void) {
      return NotificationService.initForegroundMessaging(onMessageReceived);
    },
    triggerAdminPushMessage(title: string, body: string, type: any, link?: string) {
      return NotificationService.triggerAdminPushMessage(title, body, type, link);
    }
  }
};
export type FirebaseRepositoryType = typeof FirebaseRepository;
