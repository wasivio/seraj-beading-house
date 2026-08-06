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
      return AuthService.onAuthStateChanged((user) => {
        if (!user) {
          callback(null);
        } else {
          callback({
            uid: user.uid,
            name: user.displayName || 'Customer',
            email: user.email || '',
            phone: user.phoneNumber || '',
            photoURL: user.photoURL || ''
          });
        }
      });
    },

    async signInWithGoogle() {
      const user = await AuthService.handleGoogleLogin();
      if (!user) return null;
      return {
        uid: user.uid,
        name: user.displayName || 'Customer',
        email: user.email || '',
        phone: user.phoneNumber || '',
        photoURL: user.photoURL || ''
      };
    },

    async signInWithEmail(email: string) {
      const user = await AuthService.signInWithEmail(email);
      if (!user) return null;
      return {
        uid: user.uid,
        name: user.displayName || 'Customer',
        email: user.email || '',
        phone: user.phoneNumber || '',
        photoURL: user.photoURL || ''
      };
    },

    async signInWithPhone(phone: string, otp: string) {
      const user = await AuthService.signInWithPhone(phone, otp);
      if (!user) return null;
      return {
        uid: user.uid,
        name: user.displayName || 'Customer',
        email: user.email || '',
        phone: user.phoneNumber || '',
        photoURL: user.photoURL || ''
      };
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
    triggerAdminPushMessage(title: string, body: string, type: any, link?: string) {
      return NotificationService.triggerAdminPushMessage(title, body, type, link);
    }
  }
};
export type FirebaseRepositoryType = typeof FirebaseRepository;
