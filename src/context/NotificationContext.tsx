import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  PushNotificationItem, 
  NotificationPreferences, 
  notificationService, 
  DEFAULT_NOTIFICATION_PREFERENCES 
} from '../services/notificationService';
import { useProducts } from './ProductContext';
import { useToast } from './ToastContext';

interface NotificationContextType {
  notifications: PushNotificationItem[];
  unreadCount: number;
  preferences: NotificationPreferences;
  activeBanner: PushNotificationItem | null;
  hasPermission: boolean;
  isPermissionModalOpen: boolean;
  requestPermission: () => Promise<boolean>;
  openPermissionModal: () => void;
  closePermissionModal: () => void;
  dismissBanner: () => void;
  triggerPushNotification: (item: Omit<PushNotificationItem, 'id' | 'timestamp' | 'isRead' | 'status'>) => void;
  sendSampleNotification: (type?: 'return' | 'warranty') => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(() =>
    notificationService.getStoredNotifications()
  );
  const [preferences, setPreferences] = useState<NotificationPreferences>(() =>
    notificationService.getPreferences()
  );
  const [activeBanner, setActiveBanner] = useState<PushNotificationItem | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return true;
  });
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const { products } = useProducts();
  const { showToast } = useToast();

  // Save to persistent storage whenever notifications change
  useEffect(() => {
    notificationService.saveNotifications(notifications);
  }, [notifications]);

  // Save preferences
  useEffect(() => {
    notificationService.savePreferences(preferences);
  }, [preferences]);

  // Automatically generate reminders into notification center when products change
  useEffect(() => {
    if (products.length > 0 && preferences.enabled) {
      const generated = notificationService.generateScheduleFromProducts(products, preferences);
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const newItems = generated.filter((g) => !existingIds.has(g.id));
        return [...newItems, ...prev];
      });
    }
  }, [products, preferences]);

  // Dismiss active push banner
  const dismissBanner = useCallback(() => {
    setActiveBanner(null);
  }, []);

  // Trigger an immediate push notification
  const triggerPushNotification = useCallback(
    (item: Omit<PushNotificationItem, 'id' | 'timestamp' | 'isRead' | 'status'>) => {
      const newNotif: PushNotificationItem = {
        ...item,
        id: `push-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: new Date().toISOString(),
        isRead: false,
        status: 'delivered',
      };

      setNotifications((prev) => [newNotif, ...prev]);

      // Pop in-app animated push banner
      setActiveBanner(newNotif);

      // Web Notification API fallback if supported and allowed
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(newNotif.title, {
            body: newNotif.body,
            icon: '/favicon.ico',
          });
        } catch (e) {
          console.warn('Browser notification error', e);
        }
      }

      // Auto dismiss banner after 6 seconds
      setTimeout(() => {
        setActiveBanner((current) => (current?.id === newNotif.id ? null : current));
      }, 6000);
    },
    []
  );

  // Send a realistic sample notification for demonstration
  const sendSampleNotification = useCallback(
    (type: 'return' | 'warranty' = 'return') => {
      if (type === 'return') {
        triggerPushNotification({
          productName: 'Samsung Galaxy A55',
          title: 'Return Window Notice',
          body: 'Samsung Galaxy A55 return period ends tomorrow. Inspect items if you plan to return.',
          type: 'return',
          leadTimeDays: 1,
        });
      } else {
        triggerPushNotification({
          productName: 'Dell Laptop',
          title: 'Warranty Expiry Alert',
          body: 'Dell Laptop warranty expires in 7 days. Check hardware before coverage ends.',
          type: 'warranty',
          leadTimeDays: 7,
        });
      }
      showToast('Push notification simulated on device', 'success', 2000);
    },
    [triggerPushNotification, showToast]
  );

  // Request notification permissions gracefully
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        const granted = result === 'granted';
        setHasPermission(granted);
        setIsPermissionModalOpen(false);
        if (granted) {
          showToast('Notifications enabled successfully', 'success');
        } else {
          showToast('Notification permission was declined', 'info');
        }
        return granted;
      } catch {
        setHasPermission(true);
        setIsPermissionModalOpen(false);
        return true;
      }
    } else {
      setHasPermission(true);
      setIsPermissionModalOpen(false);
      showToast('Notifications enabled', 'success');
      return true;
    }
  }, [showToast]);

  const openPermissionModal = useCallback(() => {
    setIsPermissionModalOpen(true);
  }, []);

  const closePermissionModal = useCallback(() => {
    setIsPermissionModalOpen(false);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read', 'info');
  }, [showToast]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    showToast('Notifications cleared', 'info');
  }, [showToast]);

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      return next;
    });
    showToast('Notification preferences updated', 'success', 1800);
  }, [showToast]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        activeBanner,
        hasPermission,
        isPermissionModalOpen,
        requestPermission,
        openPermissionModal,
        closePermissionModal,
        dismissBanner,
        triggerPushNotification,
        sendSampleNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        updatePreferences,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
