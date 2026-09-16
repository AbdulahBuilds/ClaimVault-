import { Product } from '../types';
import { getSampleProducts } from '../data/mockProducts';
import { storageService, STORAGE_KEYS } from './storageService';
import { authService } from './authService';

class ProductService {
  private getUserKey(explicitKey?: string): string {
    if (explicitKey) return explicitKey;
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
    // Simulated async execution for realism
    await new Promise((r) => setTimeout(r, 40));
    return this.getStoredProducts(userKey);
  }

  public async getById(id: string, userKey?: string): Promise<Product | undefined> {
    const products = this.getStoredProducts(userKey);
    return products.find((p) => p.id === id);
  }

  public async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, userKey?: string): Promise<Product> {
    const products = this.getStoredProducts(userKey);
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProduct, ...products];
    this.saveProducts(updated, userKey);
    return newProduct;
  }

  public async update(id: string, updates: Partial<Product>, userKey?: string): Promise<Product> {
    const products = this.getStoredProducts(userKey);
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
    return updatedProduct;
  }

  public async delete(id: string, userKey?: string): Promise<boolean> {
    const products = this.getStoredProducts(userKey);
    const filtered = products.filter((p) => p.id !== id);
    this.saveProducts(filtered, userKey);
    return true;
  }

  public async loadSampleData(userKey?: string): Promise<Product[]> {
    const samples = getSampleProducts();
    this.saveProducts(samples, userKey);
    return samples;
  }

  public async resetToDefault(userKey?: string): Promise<Product[]> {
    return this.loadSampleData(userKey);
  }

  public async clearAll(userKey?: string): Promise<void> {
    this.saveProducts([], userKey);
  }
}

export const productService = new ProductService();


