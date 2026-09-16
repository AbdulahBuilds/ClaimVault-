import { Product, Reminder } from '../types';
import { getDaysDifference, getNow } from '../utils/dateUtils';

export interface PushNotificationItem {
  id: string;
  productId?: string;
  productName: string;
  title: string;
  body: string;
  type: 'return' | 'warranty' | 'system' | 'custom';
  timestamp: string;
  scheduledFor?: string;
  isRead: boolean;
  leadTimeDays?: number;
  status: 'delivered' | 'scheduled' | 'sent';
}

export interface NotificationPreferences {
  enabled: boolean;
  leadTimes: number[]; // e.g. [30, 14, 7, 3, 1, 0] (0 = on deadline)
  sound: boolean;
  returnAlerts: boolean;
  warrantyAlerts: boolean;
}

import { storageService, STORAGE_KEYS } from './storageService';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  leadTimes: [30, 7, 3, 1, 0],
  sound: true,
  returnAlerts: true,
  warrantyAlerts: true,
};

class NotificationService {
  public getStoredNotifications(): PushNotificationItem[] {
    const notifs = storageService.getItem<PushNotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS);
    if (notifs && Array.isArray(notifs)) {
      return notifs;
    }
    return [];
  }

  public saveNotifications(items: PushNotificationItem[]): void {
    storageService.setItem(STORAGE_KEYS.NOTIFICATIONS, items);
  }

  public getPreferences(): NotificationPreferences {
    const prefs = storageService.getItem<NotificationPreferences>(STORAGE_KEYS.PREFERENCES);
    return prefs || DEFAULT_NOTIFICATION_PREFERENCES;
  }

  public savePreferences(prefs: NotificationPreferences): void {
    storageService.setItem(STORAGE_KEYS.PREFERENCES, prefs);
  }

  public generateInitialNotifications(): PushNotificationItem[] {
    const now = new Date();
    return [
      {
        id: 'notif-1',
        productName: 'Samsung Galaxy A55',
        title: 'Return Window Ending',
        body: 'Samsung Galaxy A55 return period ends tomorrow. Inspect items if you plan to return.',
        type: 'return',
        timestamp: new Date(now.getTime() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        isRead: false,
        leadTimeDays: 1,
        status: 'delivered',
      },
      {
        id: 'notif-2',
        productName: 'Dell Laptop',
        title: 'Warranty Expiry Alert',
        body: 'Dell Laptop warranty expires in 18 days. Check hardware integrity before coverage ends.',
        type: 'warranty',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        isRead: false,
        leadTimeDays: 18,
        status: 'delivered',
      },
      {
        id: 'notif-3',
        productName: 'AirPods Pro',
        title: 'Warranty Active',
        body: 'AirPods Pro warranty coverage is safe and active with Apple Pakistan.',
        type: 'warranty',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        isRead: true,
        status: 'delivered',
      },
    ];
  }

  // Generate scheduled notifications from products based on preferences
  public generateScheduleFromProducts(
    products: Product[],
    preferences: NotificationPreferences
  ): PushNotificationItem[] {
    if (!preferences.enabled) return [];

    const now = getNow();
    const scheduled: PushNotificationItem[] = [];

    products.forEach((p) => {
      // Return alerts
      if (preferences.returnAlerts && p.returnInfo.hasReturnPeriod && p.returnInfo.returnDeadline) {
        const days = getDaysDifference(p.returnInfo.returnDeadline, now);
        if (days >= 0 && days <= 30) {
          let body = '';
          if (days === 0) {
            body = `${p.name} return period ends today!`;
          } else if (days === 1) {
            body = `${p.name} return period ends tomorrow.`;
          } else {
            body = `${p.name} return period ends in ${days} days.`;
          }

          scheduled.push({
            id: `sched-ret-${p.id}`,
            productId: p.id,
            productName: p.name,
            title: 'Return Window Notice',
            body,
            type: 'return',
            timestamp: now.toISOString(),
            scheduledFor: p.returnInfo.returnDeadline,
            isRead: false,
            leadTimeDays: days,
            status: days <= 1 ? 'delivered' : 'scheduled',
          });
        }
      }

      // Warranty alerts
      if (preferences.warrantyAlerts && p.warranty.expiryDate) {
        const days = getDaysDifference(p.warranty.expiryDate, now);
        if (days >= 0 && days <= 60) {
          let body = '';
          if (days === 0) {
            body = `${p.name} warranty expires today!`;
          } else if (days === 1) {
            body = `${p.name} warranty expires tomorrow.`;
          } else if (days <= 7) {
            body = `${p.name} warranty expires in ${days} days.`;
          } else {
            body = `${p.name} warranty expires in ${days} days.`;
          }

          scheduled.push({
            id: `sched-war-${p.id}`,
            productId: p.id,
            productName: p.name,
            title: 'Warranty Expiration Alert',
            body,
            type: 'warranty',
            timestamp: now.toISOString(),
            scheduledFor: p.warranty.expiryDate,
            isRead: false,
            leadTimeDays: days,
            status: days <= 7 ? 'delivered' : 'scheduled',
          });
        }
      }
    });

    return scheduled;
  }
}

export const notificationService = new NotificationService();
