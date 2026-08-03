import type { Product, Review, Order, Address, Notification, FCMConfig, Coupon } from '../types';
import { MOCK_PRODUCTS, MOCK_REVIEWS, MOCK_COUPONS, MOCK_NOTIFICATIONS } from '../utils/mockData';

// Simulated state persisted in localStorage
const KEYS = {
  USER: 'siraj_auth_user',
  ORDERS: 'siraj_orders',
  REVIEWS: 'siraj_product_reviews',
  NOTIFICATIONS: 'siraj_notifs',
  FCM_CONFIG: 'siraj_fcm_config',
  WISHLIST: 'siraj_wishlist',
  CART: 'siraj_cart',
  USER_ADDRESSES: 'siraj_addresses'
};

// Initializer helper
const getOrSetLocalStorage = <T>(key: string, initial: T): T => {
  const existing = localStorage.getItem(key);
  if (existing) {
    try { return JSON.parse(existing) as T; } catch { return initial; }
  }
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

// Initialize collections if they don't exist
getOrSetLocalStorage<Review[]>(KEYS.REVIEWS, MOCK_REVIEWS);
getOrSetLocalStorage<Order[]>(KEYS.ORDERS, []);
getOrSetLocalStorage<Notification[]>(KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
getOrSetLocalStorage<FCMConfig>(KEYS.FCM_CONFIG, {
  token: null,
  permission: 'default',
  enabled: true,
  settings: {
    welcome: true,
    newProduct: true,
    festivalOffer: true,
    flashSale: true,
    priceDrop: true,
    orderUpdate: true,
    deliveryUpdate: true,
    backInStock: true
  }
});

// Auth callbacks container (simulates onAuthStateChanged)
type AuthCallback = (user: { name: string; email: string; phone: string; photoURL?: string } | null) => void;
const authListeners = new Set<AuthCallback>();

export const firebaseService = {
  // ==========================================
  // AUTHENTICATION SERVICES
  // ==========================================
  auth: {
    getCurrentUser() {
      const u = localStorage.getItem(KEYS.USER);
      return u ? JSON.parse(u) : null;
    },

    onAuthStateChanged(callback: AuthCallback) {
      authListeners.add(callback);
      // Immediately call with current user
      callback(this.getCurrentUser());
      return () => {
        authListeners.delete(callback);
      };
    },

    async signInWithGoogle() {
      // Simulate Google authentication delay
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser = {
        name: 'Seraj Bedding Fan',
        email: 'customer@gmail.com',
        phone: '+91 98765 43210',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
      };
      localStorage.setItem(KEYS.USER, JSON.stringify(mockUser));
      
      // Auto welcome notification
      firebaseService.fcm.triggerLocalNotification(
        'Welcome Back! 👋',
        'Successfully signed in with Google. Enjoy browsing premium home collections.',
        'announcement'
      );

      // Notify listeners
      authListeners.forEach(listener => listener(mockUser));
      return mockUser;
    },

    async signInWithEmail(email: string) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser = {
        name: email.split('@')[0].toUpperCase(),
        email: email,
        phone: '+91 99887 76655',
        photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150'
      };
      localStorage.setItem(KEYS.USER, JSON.stringify(mockUser));
      
      firebaseService.fcm.triggerLocalNotification(
        'Welcome Back! 🏠',
        `Logged in successfully as ${mockUser.name}.`,
        'announcement'
      );

      authListeners.forEach(listener => listener(mockUser));
      return mockUser;
    },

    async signInWithPhone(phone: string, otp: string) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (otp !== '123456') {
        throw new Error('Invalid OTP. Please enter 123456 to test.');
      }
      const mockUser = {
        name: 'Guest Guest',
        email: 'phone_user@sirajbedding.com',
        phone: phone,
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'
      };
      localStorage.setItem(KEYS.USER, JSON.stringify(mockUser));

      firebaseService.fcm.triggerLocalNotification(
        'OTP Verified Successful! 📱',
        'Secure session initialized. Continue placing your order.',
        'announcement'
      );

      authListeners.forEach(listener => listener(mockUser));
      return mockUser;
    },

    logout() {
      localStorage.removeItem(KEYS.USER);
      authListeners.forEach(listener => listener(null));
    }
  },

  // ==========================================
  // FIRESTORE SERVICES
  // ==========================================
  firestore: {
    // PRODUCTS
    async getProducts(): Promise<Product[]> {
      // Simulate network request latency
      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_PRODUCTS;
    },

    async getProductById(id: string): Promise<Product | undefined> {
      await new Promise(resolve => setTimeout(resolve, 150));
      return MOCK_PRODUCTS.find(p => p.id === id);
    },

    // REVIEWS
    async getReviewsByProductId(productId: string): Promise<Review[]> {
      const allReviews = getOrSetLocalStorage<Review[]>(KEYS.REVIEWS, MOCK_REVIEWS);
      return allReviews.filter(r => r.productId === productId);
    },

    async addReview(review: Omit<Review, 'id' | 'date' | 'likes' | 'reported'>): Promise<Review> {
      const allReviews = getOrSetLocalStorage<Review[]>(KEYS.REVIEWS, MOCK_REVIEWS);
      const newReview: Review = {
        ...review,
        id: `rev-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        likes: 0,
        reported: false
      };
      allReviews.unshift(newReview);
      localStorage.setItem(KEYS.REVIEWS, JSON.stringify(allReviews));

      // Trigger local push notification alert for product reviews
      firebaseService.fcm.triggerLocalNotification(
        'Review Submitted! ⭐',
        `Thank you for reviewing the product. Your feedback is verified.`,
        'announcement'
      );

      return newReview;
    },

    // ORDERS
    async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'trackingTimeline'>): Promise<Order> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const orders = getOrSetLocalStorage<Order[]>(KEYS.ORDERS, []);
      
      const orderNumber = `SBH-${Math.floor(100000 + Math.random() * 900000)}`;
      const trackingTimeline = [
        { status: 'pending', title: 'Order Placed', description: 'Your order has been registered.', date: new Date().toLocaleDateString(), isCompleted: true },
        { status: 'confirmed', title: 'Order Confirmed', description: 'Seller accepted your order.', date: '', isCompleted: false },
        { status: 'packed', title: 'Packed', description: 'Item bubble-wrapped and boxed.', date: '', isCompleted: false },
        { status: 'shipped', title: 'Shipped', description: 'Dispatched through BlueDart Courier.', date: '', isCompleted: false },
        { status: 'out_for_delivery', title: 'Out For Delivery', description: 'Courier partner is bringing it today.', date: '', isCompleted: false },
        { status: 'delivered', title: 'Delivered', description: 'Order handed over safely.', date: '', isCompleted: false }
      ] as any[];

      const newOrder: Order = {
        ...orderData,
        id: `order-${Date.now()}`,
        orderNumber,
        status: 'pending',
        trackingTimeline,
        createdAt: new Date().toISOString()
      };

      orders.unshift(newOrder);
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

      // Sync Order Confirmation FCM Push Notification
      firebaseService.fcm.triggerLocalNotification(
        'Order Confirmed! 🎉',
        `Order ${orderNumber} for ₹${newOrder.grandTotal.toLocaleString()} has been placed successfully.`,
        'order',
        `/profile/orders`
      );

      // Setup a background scheduler notification simulation (Updates Order status step by step over time)
      // Confirm after 2 minutes
      setTimeout(() => {
        firebaseService.firestore.simulateOrderStatusUpdate(newOrder.id, 'confirmed');
      }, 40000);

      return newOrder;
    },

    async getOrders(): Promise<Order[]> {
      await new Promise(resolve => setTimeout(resolve, 300));
      return getOrSetLocalStorage<Order[]>(KEYS.ORDERS, []);
    },

    async getOrderById(id: string): Promise<Order | undefined> {
      const orders = getOrSetLocalStorage<Order[]>(KEYS.ORDERS, []);
      return orders.find(o => o.id === id);
    },

    // Simulate order state machine for demonstration
    simulateOrderStatusUpdate(orderId: string, status: Order['status']) {
      const orders = getOrSetLocalStorage<Order[]>(KEYS.ORDERS, []);
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex > -1) {
        const order = orders[orderIndex];
        order.status = status;
        
        // Find corresponding step in timeline
        const timeline = order.trackingTimeline.map(step => {
          if (step.status === status) {
            return { ...step, isCompleted: true, date: new Date().toLocaleDateString() };
          }
          return step;
        });

        order.trackingTimeline = timeline;
        orders[orderIndex] = order;
        localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

        // Trigger Notification
        let title = 'Order Update';
        let body = `Your order ${order.orderNumber} status changed to ${status}.`;
        if (status === 'confirmed') {
          title = 'Order Confirmed! ✅';
          body = `Great news! Siraj Bedding House confirmed your order ${order.orderNumber}.`;
        } else if (status === 'packed') {
          title = 'Order Packed! 📦';
          body = `Your order ${order.orderNumber} has been safely packed and ready for pickup.`;
        } else if (status === 'shipped') {
          title = 'Order Dispatched! 🚚';
          body = `Courier team is on their way with order ${order.orderNumber}. Tracking link available.`;
        } else if (status === 'out_for_delivery') {
          title = 'Out for Delivery! 🛵';
          body = `Our delivery agent is nearby with order ${order.orderNumber}. Keep your phone handy.`;
        } else if (status === 'delivered') {
          title = 'Order Delivered! 🎁';
          body = `Order ${order.orderNumber} was successfully delivered. Sleep tight!`;
        }

        firebaseService.fcm.triggerLocalNotification(title, body, 'delivery', `/profile/orders`);
        
        // Trigger generic window event for UI refresh
        window.dispatchEvent(new Event('order_status_sync'));
      }
    },

    // ADDRESS MANAGEMENT
    async getAddresses(): Promise<Address[]> {
      return getOrSetLocalStorage<Address[]>(KEYS.USER_ADDRESSES, [
        {
          id: 'addr-1',
          name: 'Yashu Kumar',
          phone: '+91 99887 76655',
          email: 'yashu@gmail.com',
          addressLine: 'Flat 402, Luxury Heights, Near Mall Road',
          city: 'Gorakhpur',
          state: 'Uttar Pradesh',
          pincode: '273001',
          isDefault: true,
          type: 'home'
        }
      ]);
    },

    async saveAddress(address: Omit<Address, 'id'> & { id?: string }): Promise<Address> {
      const addresses = getOrSetLocalStorage<Address[]>(KEYS.USER_ADDRESSES, []);
      if (address.id) {
        // Edit existing
        const index = addresses.findIndex(a => a.id === address.id);
        if (index > -1) {
          addresses[index] = address as Address;
        }
      } else {
        // Create new
        const newAddress: Address = {
          ...address,
          id: `addr-${Date.now()}`
        } as Address;
        if (address.isDefault) {
          addresses.forEach(a => a.isDefault = false);
        }
        addresses.push(newAddress);
        address.id = newAddress.id;
      }
      
      // If we mark it default, reset others
      if (address.isDefault) {
        addresses.forEach(a => {
          if (a.id !== address.id) a.isDefault = false;
        });
      }

      localStorage.setItem(KEYS.USER_ADDRESSES, JSON.stringify(addresses));
      return address as Address;
    },

    async deleteAddress(id: string): Promise<void> {
      const addresses = getOrSetLocalStorage<Address[]>(KEYS.USER_ADDRESSES, []);
      const filtered = addresses.filter(a => a.id !== id);
      localStorage.setItem(KEYS.USER_ADDRESSES, JSON.stringify(filtered));
    },

    // COUPONS
    async validateCoupon(code: string, subtotal: number): Promise<Coupon> {
      await new Promise(resolve => setTimeout(resolve, 200));
      const coupon = MOCK_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());
      if (!coupon) {
        throw new Error('Invalid coupon code. Try WELCOME100');
      }
      if (subtotal < coupon.minPurchase) {
        throw new Error(`Minimum purchase of ₹${coupon.minPurchase} required for this coupon.`);
      }
      return coupon;
    }
  },

  // ==========================================
  // FIREBASE CLOUD MESSAGING (FCM) SIMULATION
  // ==========================================
  fcm: {
    getNotificationHistory(): Notification[] {
      return getOrSetLocalStorage<Notification[]>(KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
    },

    getUnreadCount(): number {
      const history = this.getNotificationHistory();
      return history.filter(n => !n.isRead).length;
    },

    markAsRead(id: string) {
      const history = this.getNotificationHistory();
      const item = history.find(n => n.id === id);
      if (item) {
        item.isRead = true;
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(history));
        window.dispatchEvent(new Event('notif_history_sync'));
      }
    },

    markAllAsRead() {
      const history = this.getNotificationHistory();
      history.forEach(n => n.isRead = true);
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(history));
      window.dispatchEvent(new Event('notif_history_sync'));
    },

    getFCMConfig(): FCMConfig {
      return getOrSetLocalStorage<FCMConfig>(KEYS.FCM_CONFIG, {
        token: null,
        permission: 'default',
        enabled: true,
        settings: {
          welcome: true,
          newProduct: true,
          festivalOffer: true,
          flashSale: true,
          priceDrop: true,
          orderUpdate: true,
          deliveryUpdate: true,
          backInStock: true
        }
      });
    },

    saveFCMConfig(config: FCMConfig) {
      localStorage.setItem(KEYS.FCM_CONFIG, JSON.stringify(config));
      window.dispatchEvent(new Event('fcm_settings_sync'));
    },

    async requestPermission(): Promise<'granted' | 'denied'> {
      await new Promise(resolve => setTimeout(resolve, 500));
      const config = this.getFCMConfig();
      config.permission = 'granted';
      config.token = `fcm-token-${Math.random().toString(36).substr(2, 9)}-siraj-bedding`;
      this.saveFCMConfig(config);

      // Trigger Welcome Notification instantly
      this.triggerLocalNotification(
        'Notifications Enabled! 🔔',
        'Thank you! You will now receive flash offers, order progress, and restock alerts.',
        'announcement'
      );

      return 'granted';
    },

    triggerLocalNotification(title: string, body: string, type: Notification['type'], link?: string) {
      const config = this.getFCMConfig();
      
      // If notifications are disabled globally in app settings, do not save/show
      if (!config.enabled) return;

      // Filter based on sub-notification settings
      if (type === 'announcement' && !config.settings.welcome) return;
      if (type === 'product' && !config.settings.newProduct) return;
      if (type === 'festival' && !config.settings.festivalOffer) return;
      if (type === 'price_drop' && !config.settings.priceDrop) return;
      if (type === 'order' && !config.settings.orderUpdate) return;
      if (type === 'delivery' && !config.settings.deliveryUpdate) return;

      const history = this.getNotificationHistory();
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        title,
        body,
        type,
        isRead: false,
        createdAt: new Date().toISOString(),
        link
      };

      history.unshift(newNotif);
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(history));

      // Dispatch simulated native push notification event (which our UI listener grabs to show luxury toasts)
      const event = new CustomEvent('fcm_push_received', { detail: newNotif });
      window.dispatchEvent(event);
      window.dispatchEvent(new Event('notif_history_sync'));
    },

    // Trigger Admin Mock Notification (triggered from client side for demonstration)
    triggerAdminPushMessage(title: string, body: string, type: Notification['type'], link?: string) {
      this.triggerLocalNotification(
        `[ADMIN PUSH] ${title}`,
        body,
        type,
        link
      );
    }
  }
};
