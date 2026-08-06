import { db, getFCM } from '../firebase';
import { getToken } from 'firebase/messaging';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import type { Notification, FCMConfig } from '../types';
import { auth } from '../firebase';

const KEYS = {
  NOTIFICATIONS: 'siraj_notifs',
  FCM_CONFIG: 'siraj_fcm_config',
};

const getLocalOrInitial = <T>(key: string, initial: T): T => {
  const local = localStorage.getItem(key);
  if (local) {
    try { return JSON.parse(local) as T; } catch { return initial; }
  }
  return initial;
};

const defaultFcmConfig: FCMConfig = {
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
};

export const NotificationService = {
  getFCMConfig(): FCMConfig {
    const user = auth.currentUser;
    if (user) {
      return getLocalOrInitial<FCMConfig>(`${KEYS.FCM_CONFIG}_${user.uid}`, defaultFcmConfig);
    }
    return getLocalOrInitial<FCMConfig>(KEYS.FCM_CONFIG, defaultFcmConfig);
  },

  async saveFCMConfig(config: FCMConfig): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      localStorage.setItem(`${KEYS.FCM_CONFIG}_${user.uid}`, JSON.stringify(config));
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { fcmToken: config.token }).catch(() => {});
    } else {
      localStorage.setItem(KEYS.FCM_CONFIG, JSON.stringify(config));
    }
    window.dispatchEvent(new Event('fcm_settings_sync'));
  },

  getNotificationHistory(): Notification[] {
    const user = auth.currentUser;
    const key = user ? `${KEYS.NOTIFICATIONS}_${user.uid}` : KEYS.NOTIFICATIONS;
    return getLocalOrInitial<Notification[]>(key, []);
  },

  async saveNotificationHistory(notifs: Notification[]): Promise<void> {
    const user = auth.currentUser;
    const key = user ? `${KEYS.NOTIFICATIONS}_${user.uid}` : KEYS.NOTIFICATIONS;
    localStorage.setItem(key, JSON.stringify(notifs));
    
    if (user) {
      const docRef = doc(db, 'notifications', user.uid);
      await setDoc(docRef, { items: notifs }).catch(() => {});
    }
    window.dispatchEvent(new Event('notif_history_sync'));
  },

  getUnreadCount(): number {
    const history = this.getNotificationHistory();
    return history.filter(n => !n.isRead).length;
  },

  async markAsRead(id: string): Promise<void> {
    const history = this.getNotificationHistory();
    const updated = history.map(n => n.id === id ? { ...n, isRead: true } : n);
    await this.saveNotificationHistory(updated);
  },

  async markAllAsRead(): Promise<void> {
    const history = this.getNotificationHistory();
    const updated = history.map(n => ({ ...n, isRead: true }));
    await this.saveNotificationHistory(updated);
  },

  async requestPermission(): Promise<'granted' | 'denied' | 'default'> {
    if (!('Notification' in window)) return 'denied';

    const permission = await Notification.requestPermission();
    const config = this.getFCMConfig();
    config.permission = permission;

    if (permission === 'granted') {
      const user = auth.currentUser;
      if (user) {
        const messaging = getFCM();
        if (messaging) {
          try {
            const token = await getToken(messaging);
            if (token) {
              config.token = token;
            }
          } catch (e) {
            console.warn('Could not register FCM client token, falling back to simulated push token', e);
            config.token = `simulated-fcm-token-${user.uid}`;
          }
        } else {
          config.token = `simulated-fcm-token-${user.uid}`;
        }
      }
    } else {
      config.token = null;
    }

    await this.saveFCMConfig(config);
    return permission;
  },

  async triggerAdminPushMessage(title: string, body: string, type: Notification['type'], link?: string): Promise<void> {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      type,
      link,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const history = this.getNotificationHistory();
    await this.saveNotificationHistory([newNotif, ...history]);

    window.dispatchEvent(new CustomEvent('fcm_push_received', { detail: newNotif }));
  }
};
export type NotificationServiceType = typeof NotificationService;
