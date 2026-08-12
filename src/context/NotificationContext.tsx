import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Notification, FCMConfig } from '../types';
import { firebaseService } from '../services/firebaseService';

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
  type: Notification['type'];
  link?: string;
  imageUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fcmConfig: FCMConfig;
  activeToasts: ToastMessage[];
  showPermissionPrompt: boolean;
  setShowPermissionPrompt: (show: boolean) => void;
  requestNotificationPermission: () => Promise<'granted' | 'denied'>;
  saveFCMConfig: (config: FCMConfig) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  triggerAdminPush: (title: string, body: string, type: Notification['type'], link?: string) => void;
  dismissToast: (id: string) => void;
  showToast: (title: string, body: string, type: Notification['type'], link?: string, imageUrl?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fcmConfig, setFcmConfig] = useState<FCMConfig>(() => firebaseService.fcm.getFCMConfig());
  const [activeToasts, setActiveToasts] = useState<ToastMessage[]>([]);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);

  const refreshUnreadCount = (notifs: Notification[]) => {
    setUnreadCount(notifs.filter(n => !n.isRead).length);
  };

  useEffect(() => {
    // 1. Initial configuration check
    const currentConfig = firebaseService.fcm.getFCMConfig();
    setFcmConfig(currentConfig);

    // 2. Check if customer should be prompted for permission
    if (
      typeof window !== 'undefined' && 
      'Notification' in window && 
      Notification.permission === 'default'
    ) {
      const dismissed = sessionStorage.getItem('siraj_notif_prompt_dismissed');
      if (!dismissed) {
        // Show prompt after a slight polite delay (1.5s)
        const timer = setTimeout(() => {
          setShowPermissionPrompt(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    // 3. Realtime Firestore Notifications Subscription (catches all Admin FMC broadcasts)
    const unsubscribeFirestore = firebaseService.fcm.subscribeToFirestoreNotifications((updatedNotifs) => {
      setNotifications(updatedNotifs);
      refreshUnreadCount(updatedNotifs);
    });

    // 4. Foreground FCM push listener
    const unsubscribeForeground = firebaseService.fcm.initForegroundMessaging((notif) => {
      // Play audio chime
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});

      // Show live in-app toast
      showToast(notif.title, notif.body, notif.type, notif.link, notif.imageUrl);
    });

    // 5. Custom event listener for incoming pushes
    const handlePushReceived = (e: Event) => {
      const customEvent = e as CustomEvent<Notification>;
      const notif = customEvent.detail;
      if (!notif) return;

      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});

      showToast(notif.title, notif.body, notif.type, notif.link, notif.imageUrl);
    };

    window.addEventListener('fcm_push_received', handlePushReceived);

    return () => {
      unsubscribeFirestore();
      if (unsubscribeForeground) unsubscribeForeground();
      window.removeEventListener('fcm_push_received', handlePushReceived);
    };
  }, []);

  const showToast = (title: string, body: string, type: Notification['type'], link?: string, imageUrl?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setActiveToasts(prev => [...prev, { id, title, body, type, link, imageUrl }]);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 6000);
  };

  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const requestNotificationPermission = async (): Promise<'granted' | 'denied'> => {
    setShowPermissionPrompt(false);
    const res = await firebaseService.fcm.requestPermission();
    setFcmConfig(firebaseService.fcm.getFCMConfig());
    if (res === 'granted') {
      showToast('Notifications Enabled! 🔔', 'You will now receive order updates and exclusive deals.', 'offer');
    }
    return res === 'granted' ? 'granted' : 'denied';
  };

  const saveFCMConfig = (config: FCMConfig) => {
    firebaseService.fcm.saveFCMConfig(config);
    setFcmConfig(config);
  };

  const markNotificationAsRead = (id: string) => {
    firebaseService.fcm.markAsRead(id);
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      refreshUnreadCount(next);
      return next;
    });
  };

  const markAllNotificationsAsRead = () => {
    firebaseService.fcm.markAllAsRead();
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, isRead: true }));
      refreshUnreadCount(next);
      return next;
    });
  };

  const triggerAdminPush = (title: string, body: string, type: Notification['type'], link?: string) => {
    firebaseService.fcm.triggerAdminPushMessage(title, body, type, link);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fcmConfig,
        activeToasts,
        showPermissionPrompt,
        setShowPermissionPrompt,
        requestNotificationPermission,
        saveFCMConfig,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        triggerAdminPush,
        dismissToast,
        showToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
