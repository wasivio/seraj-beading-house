import { db, getFCM, auth } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import type { Notification, FCMConfig } from '../types';

const KEYS = {
  NOTIFICATIONS: 'siraj_notifs',
  READ_NOTIFS: 'siraj_read_notifs',
  FCM_CONFIG: 'siraj_fcm_config',
  PERMISSION_PROMPTED: 'siraj_notif_prompted',
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

let previousNotifIds = new Set<string>();
let isFirstSnapshot = true;

export const NotificationService = {
  getFCMConfig(): FCMConfig {
    const user = auth.currentUser;
    const browserPerm = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
    const key = user ? `${KEYS.FCM_CONFIG}_${user.uid}` : KEYS.FCM_CONFIG;
    const saved = getLocalOrInitial<FCMConfig>(key, defaultFcmConfig);
    return {
      ...saved,
      permission: browserPerm
    };
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

  getReadIds(): string[] {
    const user = auth.currentUser;
    const key = user ? `${KEYS.READ_NOTIFS}_${user.uid}` : KEYS.READ_NOTIFS;
    return getLocalOrInitial<string[]>(key, []);
  },

  saveReadId(id: string) {
    const reads = this.getReadIds();
    if (!reads.includes(id)) {
      const updated = [...reads, id];
      const user = auth.currentUser;
      const key = user ? `${KEYS.READ_NOTIFS}_${user.uid}` : KEYS.READ_NOTIFS;
      localStorage.setItem(key, JSON.stringify(updated));
    }
  },

  saveAllReadIds(ids: string[]) {
    const user = auth.currentUser;
    const key = user ? `${KEYS.READ_NOTIFS}_${user.uid}` : KEYS.READ_NOTIFS;
    localStorage.setItem(key, JSON.stringify(ids));
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
    window.dispatchEvent(new Event('notif_history_sync'));
  },

  getUnreadCount(): number {
    const history = this.getNotificationHistory();
    return history.filter(n => !n.isRead).length;
  },

  async markAsRead(id: string): Promise<void> {
    this.saveReadId(id);
    const history = this.getNotificationHistory();
    const updated = history.map(n => n.id === id ? { ...n, isRead: true } : n);
    await this.saveNotificationHistory(updated);

    // Also sync with Firestore if logged in
    const user = auth.currentUser;
    if (user) {
      try {
        const notifDocRef = doc(db, 'notifications', id);
        await updateDoc(notifDocRef, {
          readBy: arrayUnion(user.uid)
        }).catch(() => {});
      } catch {}
    }
  },

  async markAllAsRead(): Promise<void> {
    const history = this.getNotificationHistory();
    const allIds = history.map(n => n.id);
    this.saveAllReadIds(allIds);
    const updated = history.map(n => ({ ...n, isRead: true }));
    await this.saveNotificationHistory(updated);
  },

  async requestPermission(): Promise<'granted' | 'denied' | 'default'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      const config = this.getFCMConfig();
      config.permission = permission;

      if (permission === 'granted') {
        // Register service worker if supported
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          } catch (swErr) {
            console.warn('Service Worker registration note:', swErr);
          }
        }

        const messaging = getFCM();
        if (messaging) {
          try {
            const token = await getToken(messaging, {
              vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined
            });
            if (token) {
              config.token = token;
              // Store token in Firestore for Admin FMC broadcaster
              const tokenDocRef = doc(db, 'fcmTokens', token.slice(0, 64));
              await setDoc(tokenDocRef, {
                token,
                uid: auth.currentUser?.uid || 'guest',
                userAgent: navigator.userAgent,
                updatedAt: serverTimestamp()
              }, { merge: true }).catch(() => {});
            }
          } catch (e) {
            console.warn('Could not register FCM client token, using device push channel', e);
          }
        }
      } else {
        config.token = null;
      }

      await this.saveFCMConfig(config);
      localStorage.setItem(KEYS.PERMISSION_PROMPTED, 'true');
      return permission;
    } catch (e) {
      console.warn('Notification permission request error:', e);
      return 'denied';
    }
  },

  /**
   * Realtime Firestore listener for Admin-sent FMC Broadcasts & User Notifications
   */
  subscribeToFirestoreNotifications(onUpdate: (notifs: Notification[]) => void) {
    const colRef = collection(db, 'notifications');

    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const user = auth.currentUser;
      const readIds = new Set(this.getReadIds());
      const firestoreNotifs: Notification[] = [];

      snapshot.docs.forEach(docSnap => {
        const raw: any = docSnap.data();

        // Check if doc is an array container ({ items: [...] })
        if (Array.isArray(raw.items)) {
          if (!raw.userId || raw.userId === 'all' || (user && raw.userId === user.uid)) {
            raw.items.forEach((item: any, idx: number) => {
              const itemId = item.id || `${docSnap.id}_${idx}`;
              const isRead = item.isRead === true || readIds.has(itemId) || (user && item.readBy?.includes(user.uid));
              firestoreNotifs.push({
                id: itemId,
                title: item.title || item.heading || 'Special Update',
                body: item.body || item.message || item.description || item.text || '',
                type: item.type || 'announcement',
                link: item.link || item.url || item.route || '',
                imageUrl: item.imageUrl || item.image || '',
                isRead: !!isRead,
                createdAt: item.createdAt || new Date().toISOString()
              });
            });
          }
        } else {
          // Single notification doc
          const docId = docSnap.id;
          const targetUser = raw.userId || raw.uid || raw.target || raw.audience || 'all';
          const isTargeted = targetUser === 'all' || targetUser === 'broadcast' || targetUser === 'customers' || (user && targetUser === user.uid);

          if (isTargeted) {
            const isRead = raw.isRead === true || readIds.has(docId) || (user && Array.isArray(raw.readBy) && raw.readBy.includes(user.uid));
            
            // Format creation date
            let createdIso = new Date().toISOString();
            if (raw.createdAt) {
              if (typeof raw.createdAt === 'string') createdIso = raw.createdAt;
              else if (raw.createdAt?.toDate) createdIso = raw.createdAt.toDate().toISOString();
              else if (typeof raw.createdAt === 'number') createdIso = new Date(raw.createdAt).toISOString();
            }

            firestoreNotifs.push({
              id: docId,
              title: raw.title || raw.heading || 'Notification',
              body: raw.body || raw.message || raw.description || raw.text || '',
              type: raw.type || 'announcement',
              link: raw.link || raw.url || raw.route || '',
              imageUrl: raw.imageUrl || raw.image || '',
              audience: raw.audience || 'all',
              userId: raw.userId || 'all',
              readBy: raw.readBy || [],
              isRead: !!isRead,
              createdAt: createdIso
            });
          }
        }
      });

      // Sort newest first
      firestoreNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Detect newly received notifications in real-time
      if (!isFirstSnapshot) {
        firestoreNotifs.forEach(notif => {
          if (!previousNotifIds.has(notif.id)) {
            // New incoming push notification from Admin!
            window.dispatchEvent(new CustomEvent('fcm_push_received', { detail: notif }));
            
            // Trigger OS Notification if permission granted
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new window.Notification(notif.title, {
                  body: notif.body,
                  icon: '/logo.jpg',
                  badge: '/logo.jpg'
                });
              } catch {}
            }
          }
        });
      }

      previousNotifIds = new Set(firestoreNotifs.map(n => n.id));
      isFirstSnapshot = false;

      // Update local storage history and state
      this.saveNotificationHistory(firestoreNotifs);
      onUpdate(firestoreNotifs);
    }, (error) => {
      console.warn('Realtime notifications listener notice:', error);
      // Fallback to local storage if offline or permissions pending
      onUpdate(this.getNotificationHistory());
    });

    return unsubscribe;
  },

  /**
   * Listen to Firebase Foreground Push Messages
   */
  initForegroundMessaging(onMessageReceived: (notif: Notification) => void) {
    const messaging = getFCM();
    if (!messaging) return () => {};

    try {
      return onMessage(messaging, (payload) => {
        const title = payload.notification?.title || payload.data?.title || 'Siraj Bedding House';
        const body = payload.notification?.body || payload.data?.body || '';
        const type = (payload.data?.type as any) || 'offer';
        const link = payload.data?.link || payload.data?.url || '';

        const newNotif: Notification = {
          id: `fcm_${Date.now()}`,
          title,
          body,
          type,
          link,
          isRead: false,
          createdAt: new Date().toISOString()
        };

        onMessageReceived(newNotif);
      });
    } catch (e) {
      console.warn('Could not attach FCM foreground listener:', e);
      return () => {};
    }
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
