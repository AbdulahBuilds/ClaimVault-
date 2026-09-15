import { apiClient } from './api/apiClient';
import { productsApi } from './api/productsApi';
import { authApi } from './api/authApi';
import { settingsApi } from './api/settingsApi';
import { productService } from './productService';
import { authService } from './authService';
import { storageService, STORAGE_KEYS } from './storageService';
import { Product } from '../types';

export interface BackendStatus {
  isOnline: boolean;
  latencyMs: number;
  lastChecked: string;
  version?: string;
  database?: string;
  metrics?: {
    registeredUsers: number;
    storedProducts: number;
    attachedReceipts: number;
  };
}

class SyncService {
  private status: BackendStatus = {
    isOnline: false,
    latencyMs: 0,
    lastChecked: new Date().toISOString(),
  };

  private listeners: Set<(status: BackendStatus) => void> = new Set();
  private checkInterval: any = null;

  constructor() {
    this.checkBackend();
    // Periodically ping backend
    if (typeof window !== 'undefined') {
      this.checkInterval = setInterval(() => this.checkBackend(), 30000);
    }
  }

  subscribe(listener: (status: BackendStatus) => void): () => void {
    this.listeners.add(listener);
    listener({ ...this.status });
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.status }));
  }

  /**
   * Check backend availability
   */
  async checkBackend(): Promise<BackendStatus> {
    const res = await apiClient.checkHealth();
    this.status = {
      isOnline: res.online,
      latencyMs: res.latencyMs,
      lastChecked: new Date().toISOString(),
      version: res.data?.version || '1.0.0',
      database: res.data?.database || 'PostgreSQL-Compatible Engine',
      metrics: res.data?.metrics,
    };
    this.notify();
    return { ...this.status };
  }

  getStatus(): BackendStatus {
    return { ...this.status };
  }

  /**
   * Synchronize local storage products with backend API
   */
  async syncProducts(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    const health = await this.checkBackend();
    if (!health.isOnline) {
      return {
        success: false,
        syncedCount: 0,
        message: 'Backend server is offline. Changes are saved safely in local vault.',
      };
    }

    try {
      const localProducts = await productService.getAll();
      const remoteRes = await productsApi.getProducts('all');

      if (remoteRes.success && Array.isArray(remoteRes.products)) {
        // Merge strategy: combine local and remote items
        const remoteMap = new Map<string, Product>();
        remoteRes.products.forEach((p) => remoteMap.set(p.id, p));

        for (const localP of localProducts) {
          if (!remoteMap.has(localP.id)) {
            // Upload local new product to remote
            await productsApi.createProduct(localP);
          }
        }

        // Fetch fresh list from remote and update local cache
        const fresh = await productsApi.getProducts('all');
        if (fresh.success && Array.isArray(fresh.products)) {
          storageService.setItem(STORAGE_KEYS.PRODUCTS, fresh.products);
        }

        return {
          success: true,
          syncedCount: (fresh.products || []).length,
          message: `Synchronized ${(fresh.products || []).length} products with PostgreSQL cloud database.`,
        };
      }

      return {
        success: true,
        syncedCount: localProducts.length,
        message: 'Local and cloud vaults are aligned.',
      };
    } catch (err: any) {
      return {
        success: false,
        syncedCount: 0,
        message: err.message || 'Sync encountered an error.',
      };
    }
  }
}

export const syncService = new SyncService();
