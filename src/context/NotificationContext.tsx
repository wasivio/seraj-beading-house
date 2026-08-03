import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Notification, FCMConfig } from '../types';
import { firebaseService } from '../services/firebaseService';

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
  type: Notification['type'];
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fcmConfig: FCMConfig;
  activeToasts: ToastMessage[];
  requestNotificationPermission: () => Promise<'granted' | 'denied'>;
  saveFCMConfig: (config: FCMConfig) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  triggerAdminPush: (title: string, body: string, type: Notification['type'], link?: string) => void;
  dismissToast: (id: string) => void;
  showToast: (title: string, body: string, type: Notification['type'], link?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fcmConfig, setFcmConfig] = useState<FCMConfig>(() => firebaseService.fcm.getFCMConfig());
  const [activeToasts, setActiveToasts] = useState<ToastMessage[]>([]);

  const syncNotifications = () => {
    setNotifications(firebaseService.fcm.getNotificationHistory());
    setUnreadCount(firebaseService.fcm.getUnreadCount());
    setFcmConfig(firebaseService.fcm.getFCMConfig());
  };

  useEffect(() => {
    // Initial fetch
    syncNotifications();

    // Listen for mock DB sync events
    window.addEventListener('notif_history_sync', syncNotifications);
    window.addEventListener('fcm_settings_sync', syncNotifications);

    // Listen to custom simulated FCM push receive event
    const handlePushReceived = (e: Event) => {
      const customEvent = e as CustomEvent<Notification>;
      const notif = customEvent.detail;
      
      // Add a popup toast message to screen
      showToast(notif.title, notif.body, notif.type, notif.link);
    };

    window.addEventListener('fcm_push_received', handlePushReceived);

    return () => {
      window.removeEventListener('notif_history_sync', syncNotifications);
      window.removeEventListener('fcm_settings_sync', syncNotifications);
      window.removeEventListener('fcm_push_received', handlePushReceived);
    };
  }, []);

  const showToast = (title: string, body: string, type: Notification['type'], link?: string) => {
    const id = `toast-${Date.now()}`;
    setActiveToasts(prev => [...prev, { id, title, body, type, link }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const requestNotificationPermission = async () => {
    const res = await firebaseService.fcm.requestPermission();
    syncNotifications();
    return res;
  };

  const saveFCMConfig = (config: FCMConfig) => {
    firebaseService.fcm.saveFCMConfig(config);
    syncNotifications();
  };

  const markNotificationAsRead = (id: string) => {
    firebaseService.fcm.markAsRead(id);
    syncNotifications();
  };

  const markAllNotificationsAsRead = () => {
    firebaseService.fcm.markAllAsRead();
    syncNotifications();
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
