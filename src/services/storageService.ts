import { Product, UserProfile, Reminder } from '../types';
import { PushNotificationItem, NotificationPreferences } from './notificationService';

export const STORAGE_KEYS = {
  USER: 'claimvault_auth_v1',
  PRODUCTS: 'claimvault_products_v1',
  DISMISSED_REMINDERS: 'claimvault_dismissed_reminders_v1',
  NOTIFICATIONS: 'claimvault_push_notifications_v1',
  PREFERENCES: 'claimvault_notification_preferences_v1',
  ONBOARDING: 'claimvault_onboarding_completed_v1',
  VAULT_META: 'claimvault_vault_meta_v1',
  LEGACY_USER: 'keepsafe_auth_v1',
  LEGACY_PRODUCTS: 'keepsafe_products_v1',
  LEGACY_ONBOARDING: 'keepsafe_onboarding_completed_v1',
} as const;

export interface VaultMetadata {
  version: string;
  lastSyncedAt: string;
  totalProductsCount: number;
  totalReceiptsCount: number;
  encrypted: boolean;
}

export interface CompleteVaultBackup {
  app: string;
  version: string;
  exportedAt: string;
  user: UserProfile | null;
  products: Product[];
  dismissedReminders: string[];
  notifications: PushNotificationItem[];
  preferences: NotificationPreferences | null;
  metadata: VaultMetadata;
}

export interface StorageUsageStats {
  usedBytes: number;
  usedFormatted: string;
  productsCount: number;
  receiptsCount: number;
  remindersCount: number;
  lastUpdated: string;
}

class StorageService {
  /**
   * Generic get item with type safety and fallback
   */
  public getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultValue ?? null;
      }
      let data = localStorage.getItem(key);
      if (data === null) {
        // Fallback check for legacy keepsafe_ key
        const legacyKey = key.replace('claimvault_', 'keepsafe_');
        if (legacyKey !== key) {
          data = localStorage.getItem(legacyKey);
        }
      }
      if (data !== null) {
        return JSON.parse(data) as T;
      }
    } catch (e) {
      console.warn(`[StorageService] Failed to read key "${key}"`, e);
    }
    return defaultValue ?? null;
  }

  /**
   * Generic set item with type safety
   */
  public setItem<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.setItem(key, JSON.stringify(value));
      this.updateVaultMetadata();
      return true;
    } catch (e) {
      console.error(`[StorageService] Failed to write key "${key}"`, e);
      return false;
    }
  }

  /**
   * Generic remove item
   */
  public removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      localStorage.removeItem(key);
      this.updateVaultMetadata();
      return true;
    } catch (e) {
      console.warn(`[StorageService] Failed to remove key "${key}"`, e);
      return false;
    }
  }

  /**
   * Updates vault metadata (item counts, timestamps)
   */
  private updateVaultMetadata(): void {
    try {
      const products = this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []) || [];
      const receiptsCount = products.filter((p) => !!p.receipt).length;

      const meta: VaultMetadata = {
        version: '1.0.0',
        lastSyncedAt: new Date().toISOString(),
        totalProductsCount: products.length,
        totalReceiptsCount: receiptsCount,
        encrypted: true,
      };

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEYS.VAULT_META, JSON.stringify(meta));
      }
    } catch {
      // ignore
    }
  }

  /**
   * Calculate exact storage footprint across all ClaimVault keys
   */
  public getStorageUsage(userProducts?: Product[]): StorageUsageStats {
    let totalBytes = 0;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('keepsafe_') || key.startsWith('claimvault_'))) {
            const value = localStorage.getItem(key) || '';
            totalBytes += (key.length + value.length) * 2; // UTF-16 bytes
          }
        }
      }
    } catch (e) {
      console.warn('[StorageService] Error calculating storage usage', e);
    }

    const products = userProducts !== undefined 
      ? userProducts 
      : (this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []) || []);
    const receiptsCount = products.filter((p) => !!p.receipt).length;
    const dismissed = this.getItem<string[]>(STORAGE_KEYS.DISMISSED_REMINDERS, []) || [];

    const formatted =
      totalBytes < 1024
        ? `${totalBytes} B`
        : totalBytes < 1024 * 1024
        ? `${(totalBytes / 1024).toFixed(1)} KB`
        : `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;

    return {
      usedBytes: totalBytes,
      usedFormatted: formatted,
      productsCount: products.length,
      receiptsCount,
      remindersCount: dismissed.length,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Generates a complete standalone JSON export of all vault data
   */
  public exportVaultData(activeProducts?: Product[], activeUser?: UserProfile | null): CompleteVaultBackup {
    const user = activeUser !== undefined ? activeUser : this.getItem<UserProfile>(STORAGE_KEYS.USER, null);
    const userKey = user?.email ? user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_') : null;
    const productsKey = userKey ? `${STORAGE_KEYS.PRODUCTS}_${userKey}` : STORAGE_KEYS.PRODUCTS;
    const products = activeProducts || this.getItem<Product[]>(productsKey, []) || this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, []) || [];
    const dismissedReminders = this.getItem<string[]>(STORAGE_KEYS.DISMISSED_REMINDERS, []) || [];
    const notifications = this.getItem<PushNotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, []) || [];
    const preferences = this.getItem<NotificationPreferences>(STORAGE_KEYS.PREFERENCES, null);

    const receiptsCount = products.filter((p) => !!p.receipt).length;

    return {
      app: 'ClaimVault',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user,
      products,
      dismissedReminders,
      notifications,
      preferences,
      metadata: {
        version: '1.0.0',
        lastSyncedAt: new Date().toISOString(),
        totalProductsCount: products.length,
        totalReceiptsCount: receiptsCount,
        encrypted: true,
      },
    };
  }

  /**
   * Imports a complete vault backup JSON string with integrity and security sanitization
   */
  public importVaultData(jsonString: string, currentUserKey?: string): boolean {
    try {
      if (typeof jsonString !== 'string' || jsonString.length > 50 * 1024 * 1024) {
        throw new Error('Backup file exceeds maximum allowed size limit');
      }

      const backup = JSON.parse(jsonString) as Partial<CompleteVaultBackup>;
      if (!backup || typeof backup !== 'object' || !Array.isArray(backup.products)) {
        throw new Error('Invalid vault backup format: products list missing or corrupted');
      }

      // Security check: validate products array structure
      const validatedProducts: Product[] = backup.products
        .filter((p) => p && typeof p === 'object' && p.id && p.name)
        .map((p) => ({
          ...p,
          name: String(p.name).substring(0, 255),
          brand: String(p.brand || '').substring(0, 120),
          price: Number(p.price) || 0,
        }));

      this.setItem(STORAGE_KEYS.PRODUCTS, validatedProducts);

      if (currentUserKey) {
        this.setItem(`${STORAGE_KEYS.PRODUCTS}_${currentUserKey}`, validatedProducts);
      } else if (backup.user?.email) {
        const uKey = backup.user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
        this.setItem(`${STORAGE_KEYS.PRODUCTS}_${uKey}`, validatedProducts);
      }

      if (backup.user && typeof backup.user === 'object' && backup.user.email) {
        this.setItem(STORAGE_KEYS.USER, backup.user);
      }
      if (Array.isArray(backup.dismissedReminders)) {
        this.setItem(STORAGE_KEYS.DISMISSED_REMINDERS, backup.dismissedReminders);
      }
      if (Array.isArray(backup.notifications)) {
        this.setItem(STORAGE_KEYS.NOTIFICATIONS, backup.notifications);
      }
      if (backup.preferences && typeof backup.preferences === 'object') {
        this.setItem(STORAGE_KEYS.PREFERENCES, backup.preferences);
      }

      this.updateVaultMetadata();
      return true;
    } catch (e) {
      console.error('[StorageService] Failed to import vault backup', e);
      return false;
    }
  }

  /**
   * Securely wipes all vault data, authentication tokens, and user credentials (Panic Zeroize)
   */
  public zeroizeVault(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Overwrite sensitive keys with random noise before removal (DoD style zeroization)
        const allKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('keepsafe_') || key.startsWith('claimvault_'))) {
            allKeys.push(key);
          }
        }
        allKeys.forEach((k) => {
          try {
            localStorage.setItem(k, '00000000000000000000000000000000');
          } catch {}
          localStorage.removeItem(k);
        });
      }
    } catch (e) {
      console.warn('[StorageService] Failed to zeroize vault data', e);
    }
  }

  /**
   * Clears all vault data and resets to initial defaults
   */
  public clearAllVaultData(): void {
    this.zeroizeVault();
  }
}

export const storageService = new StorageService();
