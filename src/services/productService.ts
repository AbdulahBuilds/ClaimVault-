import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockProducts';
import { storageService, STORAGE_KEYS } from './storageService';

class ProductService {
  private getStoredProducts(): Product[] {
    const products = storageService.getItem<Product[]>(STORAGE_KEYS.PRODUCTS);
    if (products !== null && Array.isArray(products)) {
      return products;
    }
    // Check legacy key
    const legacy = storageService.getItem<Product[]>(STORAGE_KEYS.LEGACY_PRODUCTS);
    if (legacy !== null && Array.isArray(legacy)) {
      storageService.setItem(STORAGE_KEYS.PRODUCTS, legacy);
      return legacy;
    }
    // Clean default for real users: empty vault
    return [];
  }

  private saveProducts(products: Product[]): void {
    storageService.setItem(STORAGE_KEYS.PRODUCTS, products);
  }

  public async getAll(): Promise<Product[]> {
    // Simulated async execution for realism
    await new Promise((r) => setTimeout(r, 50));
    return this.getStoredProducts();
  }

  public async getById(id: string): Promise<Product | undefined> {
    const products = this.getStoredProducts();
    return products.find((p) => p.id === id);
  }

  public async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const products = this.getStoredProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProduct, ...products];
    this.saveProducts(updated);
    return newProduct;
  }

  public async update(id: string, updates: Partial<Product>): Promise<Product> {
    const products = this.getStoredProducts();
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
    this.saveProducts(products);
    return updatedProduct;
  }

  public async delete(id: string): Promise<boolean> {
    const products = this.getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);
    this.saveProducts(filtered);
    return true;
  }

  public async loadSampleData(): Promise<Product[]> {
    this.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }

  public async resetToDefault(): Promise<Product[]> {
    return this.loadSampleData();
  }

  public async clearAll(): Promise<void> {
    this.saveProducts([]);
  }
}

export const productService = new ProductService();

