import { Product } from '../types';
import { getSampleProducts } from '../data/mockProducts';
import { storageService, STORAGE_KEYS } from './storageService';
import { authService } from './authService';
import { cloudSyncService } from './cloudSyncService';

class ProductService {
  private getUserEmail(explicitKey?: string): string {
    const currentUser = authService.getUser();
    if (currentUser && currentUser.email) {
      return currentUser.email.toLowerCase().trim();
    }
    if (explicitKey && explicitKey.includes('@')) {
      return explicitKey.toLowerCase().trim();
    }
    return '';
  }

  private getUserKey(explicitKey?: string): string {
    if (explicitKey) return explicitKey.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    const currentUser = authService.getUser();
    if (currentUser && currentUser.email) {
      return currentUser.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    }
    return 'anonymous';
  }

  private getStorageKey(userKey?: string): string {
    const key = this.getUserKey(userKey);
    return `${STORAGE_KEYS.PRODUCTS}_${key}`;
  }

  private getStoredProducts(userKey?: string): Product[] {
    const storageKey = this.getStorageKey(userKey);
    const products = storageService.getItem<Product[]>(storageKey);
    if (products !== null && Array.isArray(products)) {
      return products;
    }
    // Clean default for each user account: empty vault
    return [];
  }

  private saveProducts(products: Product[], userKey?: string): void {
    const storageKey = this.getStorageKey(userKey);
    storageService.setItem(storageKey, products);
  }

  public async getAll(userKey?: string): Promise<Product[]> {
    const localProducts = this.getStoredProducts(userKey);
    const userEmail = this.getUserEmail(userKey);

    // Try fetching live cloud products if user email is available
    if (userEmail) {
      try {
        const cloudProducts = await cloudSyncService.fetchUserProductsFromCloud(userEmail);
        if (cloudProducts !== null) {
          // If cloud has records or empty list confirmed, sync to local storage
          this.saveProducts(cloudProducts, userKey);
          return cloudProducts;
        }
      } catch (err) {
        console.warn('[ProductService] Cloud fetch fallback to local:', err);
      }
    }

    return localProducts;
  }

  public async getById(id: string, userKey?: string): Promise<Product | undefined> {
    const products = this.getStoredProducts(userKey);
    return products.find((p) => p.id === id);
  }

  public async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, userKey?: string): Promise<Product> {
    const products = this.getStoredProducts(userKey);
    const userEmail = this.getUserEmail(userKey);
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProduct, ...products];
    this.saveProducts(updated, userKey);

    // Sync to Supabase in background
    if (userEmail) {
      cloudSyncService.syncProductToCloud(newProduct, userEmail).catch((e) => {
        console.warn('[ProductService] Cloud product create sync error:', e);
      });
    }

    return newProduct;
  }

  public async update(id: string, updates: Partial<Product>, userKey?: string): Promise<Product> {
    const products = this.getStoredProducts(userKey);
    const userEmail = this.getUserEmail(userKey);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }
    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    products[index] = updatedProduct;
    this.saveProducts(products, userKey);

    // Sync to Supabase in background
    if (userEmail) {
      cloudSyncService.syncProductToCloud(updatedProduct, userEmail).catch((e) => {
        console.warn('[ProductService] Cloud product update sync error:', e);
      });
    }

    return updatedProduct;
  }

  public async delete(id: string, userKey?: string): Promise<boolean> {
    const products = this.getStoredProducts(userKey);
    const userEmail = this.getUserEmail(userKey);
    const filtered = products.filter((p) => p.id !== id);
    this.saveProducts(filtered, userKey);

    // Sync deletion to Supabase in background
    if (userEmail) {
      cloudSyncService.deleteProductFromCloud(id, userEmail).catch((e) => {
        console.warn('[ProductService] Cloud product delete sync error:', e);
      });
    }

    return true;
  }

  public async loadSampleData(userKey?: string): Promise<Product[]> {
    const samples = getSampleProducts();
    const userEmail = this.getUserEmail(userKey);
    this.saveProducts(samples, userKey);

    if (userEmail) {
      for (const sample of samples) {
        cloudSyncService.syncProductToCloud(sample, userEmail).catch(() => {});
      }
    }

    return samples;
  }

  public async resetToDefault(userKey?: string): Promise<Product[]> {
    return this.loadSampleData(userKey);
  }

  public async clearAll(userKey?: string): Promise<void> {
    const products = this.getStoredProducts(userKey);
    const userEmail = this.getUserEmail(userKey);
    this.saveProducts([], userKey);

    if (userEmail) {
      for (const prod of products) {
        cloudSyncService.deleteProductFromCloud(prod.id, userEmail).catch(() => {});
      }
    }
  }

  public async syncAllLocalProductsToCloud(userKey?: string): Promise<void> {
    const userEmail = this.getUserEmail(userKey);
    if (!userEmail) return;
    const localProducts = this.getStoredProducts(userKey);
    for (const prod of localProducts) {
      await cloudSyncService.syncProductToCloud(prod, userEmail);
    }
  }
}

export const productService = new ProductService();


