import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { Product, Reminder, SummaryStats, FilterType, ProductCategory, SortType } from '../types';
import { productService } from '../services/productService';
import { calculateUrgency, getDaysDifference, getNow } from '../utils/dateUtils';
import { useToast } from './ToastContext';

import { storageService, STORAGE_KEYS } from '../services/storageService';

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  reminders: Reminder[];
  stats: SummaryStats;
  isLoading: boolean;
  searchQuery: string;
  activeFilter: FilterType;
  selectedCategory: ProductCategory | 'All';
  sortBy: SortType;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: FilterType) => void;
  setSelectedCategory: (cat: ProductCategory | 'All') => void;
  setSortBy: (sort: SortType) => void;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductById: (id: string) => Product | undefined;
  dismissReminder: (reminderId: string) => void;
  restoreDefaults: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortType>('expiry_asc');
  const [dismissedReminders, setDismissedReminders] = useState<string[]>(() => {
    return storageService.getItem<string[]>(STORAGE_KEYS.DISMISSED_REMINDERS, []) || [];
  });
  
  const { showToast } = useToast();

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (e) {
      console.error(e);
      showToast('Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Recalculate dynamic urgency & metrics based on current dates
  const dynamicProducts = useMemo(() => {
    const now = getNow();
    return products.map((p) => {
      const warrantyStatus = calculateUrgency(p.warranty.expiryDate, now);
      const returnStatus = p.returnInfo.hasReturnPeriod 
        ? calculateUrgency(p.returnInfo.returnDeadline, now) 
        : 'expired';

      return {
        ...p,
        warranty: {
          ...p.warranty,
          status: warrantyStatus,
        },
        returnInfo: {
          ...p.returnInfo,
          status: returnStatus,
        },
      };
    });
  }, [products]);

  // Summary Metrics Calculation
  const stats = useMemo<SummaryStats>(() => {
    let activeWarranties = 0;
    let expiringSoon = 0;
    let returnDeadlinesActive = 0;
    let totalProtectedValue = 0;

    dynamicProducts.forEach((p) => {
      totalProtectedValue += p.price || 0;

      if (p.warranty.status === 'safe') {
        activeWarranties++;
      }
      if (p.warranty.status === 'expiring') {
        expiringSoon++;
      }
      if (p.returnInfo.hasReturnPeriod && (p.returnInfo.status === 'safe' || p.returnInfo.status === 'expiring')) {
        returnDeadlinesActive++;
      }
    });

    return {
      totalProducts: dynamicProducts.length,
      activeWarranties,
      expiringSoon,
      returnDeadlinesActive,
      totalProtectedValue,
    };
  }, [dynamicProducts]);

  // Generate and categorize Reminders for Phase 06
  const reminders = useMemo<Reminder[]>(() => {
    const now = getNow();
    const generated: Reminder[] = [];

    dynamicProducts.forEach((p) => {
      // 1. Return deadline reminder
      if (p.returnInfo.hasReturnPeriod && p.returnInfo.returnDeadline) {
        const days = getDaysDifference(p.returnInfo.returnDeadline, now);
        const reminderId = `rem-ret-${p.id}`;
        const isCompleted = dismissedReminders.includes(reminderId);

        let bucket: 'today' | 'this_week' | 'later' = 'later';
        let title = '';
        let ruleLabel = '';
        let urgency = p.returnInfo.status;

        if (days < 0) {
          title = 'Return period expired';
          ruleLabel = 'Expired';
          urgency = 'expired';
          bucket = 'later';
        } else if (days === 0) {
          title = 'Return period ends today';
          ruleLabel = 'On Deadline';
          urgency = 'expired';
          bucket = 'today';
        } else if (days === 1) {
          title = 'Return period ends tomorrow';
          ruleLabel = '1 Day Before';
          urgency = 'expiring';
          bucket = 'today';
        } else if (days <= 3) {
          title = `Return period ends in ${days} days`;
          ruleLabel = '3 Days Before';
          urgency = 'expiring';
          bucket = 'this_week';
        } else if (days <= 7) {
          title = `Return period ends in ${days} days`;
          ruleLabel = '7 Days Before';
          urgency = 'expiring';
          bucket = 'this_week';
        } else {
          title = `Return window active (${days} days left)`;
          ruleLabel = 'Active Window';
          urgency = 'safe';
          bucket = 'later';
        }

        generated.push({
          id: reminderId,
          productId: p.id,
          productName: p.name,
          brand: p.brand,
          category: p.category,
          type: 'return',
          title,
          subtitle: `Return deadline: ${p.returnInfo.returnDeadline}`,
          dueDate: p.returnInfo.returnDeadline,
          daysRemaining: days,
          urgency,
          timeBucket: bucket,
          isCompleted,
          productPrice: p.price,
          imageUrl: p.imageUrl,
          ruleLabel,
        });
      }

      // 2. Warranty Expiry Reminder
      if (p.warranty.expiryDate) {
        const days = getDaysDifference(p.warranty.expiryDate, now);
        const reminderId = `rem-war-${p.id}`;
        const isCompleted = dismissedReminders.includes(reminderId);

        let bucket: 'today' | 'this_week' | 'later' = 'later';
        let urgency = p.warranty.status;
        let title = '';
        let ruleLabel = '';

        if (days < 0) {
          title = 'Warranty expired';
          ruleLabel = 'Expired';
          urgency = 'expired';
          bucket = 'later';
        } else if (days === 0) {
          title = 'Warranty expires today';
          ruleLabel = 'On Deadline';
          urgency = 'expired';
          bucket = 'today';
        } else if (days === 1) {
          title = 'Warranty expires tomorrow';
          ruleLabel = '1 Day Before';
          urgency = 'expiring';
          bucket = 'today';
        } else if (days <= 3) {
          title = `Warranty expires in ${days} days`;
          ruleLabel = '3 Days Before';
          urgency = 'expiring';
          bucket = 'this_week';
        } else if (days <= 7) {
          title = `Warranty expires in ${days} days`;
          ruleLabel = '7 Days Before';
          urgency = 'expiring';
          bucket = 'this_week';
        } else if (days <= 30) {
          title = `Warranty expires in ${days} days`;
          ruleLabel = 'Expiring Soon';
          urgency = 'expiring';
          bucket = 'this_week';
        } else {
          title = 'Warranty active';
          ruleLabel = 'Active Coverage';
          urgency = 'safe';
          bucket = 'later';
        }

        generated.push({
          id: reminderId,
          productId: p.id,
          productName: p.name,
          brand: p.brand,
          category: p.category,
          type: 'warranty',
          title,
          subtitle: `Warranty valid until: ${p.warranty.expiryDate}`,
          dueDate: p.warranty.expiryDate,
          daysRemaining: days,
          urgency,
          timeBucket: bucket,
          isCompleted,
          productPrice: p.price,
          imageUrl: p.imageUrl,
          ruleLabel,
        });
      }
    });

    // Sort by days remaining ascending
    return generated.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [dynamicProducts, dismissedReminders]);

  // Filtered & Sorted Products for Products Screen
  const filteredProducts = useMemo(() => {
    let result = [...dynamicProducts];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Status / Tabs filter
    if (activeFilter === 'active') {
      result = result.filter((p) => p.warranty.status === 'safe');
    } else if (activeFilter === 'expiring') {
      result = result.filter((p) => p.warranty.status === 'expiring' || p.returnInfo.status === 'expiring');
    } else if (activeFilter === 'expired') {
      result = result.filter((p) => p.warranty.status === 'expired');
    } else if (activeFilter === 'return_period') {
      result = result.filter((p) => p.returnInfo.hasReturnPeriod && p.returnInfo.status !== 'expired');
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'expiry_asc') {
        return new Date(a.warranty.expiryDate).getTime() - new Date(b.warranty.expiryDate).getTime();
      }
      if (sortBy === 'expiry_desc') {
        return new Date(b.warranty.expiryDate).getTime() - new Date(a.warranty.expiryDate).getTime();
      }
      if (sortBy === 'purchase_desc') {
        return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [dynamicProducts, searchQuery, selectedCategory, activeFilter, sortBy]);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const newProd = await productService.create(productData);
      setProducts((prev) => [newProd, ...prev]);
      showToast('Product added successfully to ClaimVault!', 'success');
      return newProd;
    } catch (e) {
      showToast('Failed to add product', 'error');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updated = await productService.update(id, updates);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast('Product updated successfully', 'success');
      return updated;
    } catch (e) {
      showToast('Failed to update product', 'error');
      throw e;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast('Product removed from vault', 'info');
      return true;
    } catch (e) {
      showToast('Failed to delete product', 'error');
      return false;
    }
  };

  const getProductById = (id: string) => {
    return dynamicProducts.find((p) => p.id === id);
  };

  const dismissReminder = (reminderId: string) => {
    setDismissedReminders((prev) => {
      const isAlreadyDismissed = prev.includes(reminderId);
      let next: string[];
      if (isAlreadyDismissed) {
        next = prev.filter((id) => id !== reminderId);
        showToast('Reminder reactivated', 'info', 1800);
      } else {
        next = [...prev, reminderId];
        showToast('Reminder marked as completed', 'success', 2000);
      }
      storageService.setItem(STORAGE_KEYS.DISMISSED_REMINDERS, next);
      return next;
    });
  };

  const restoreDefaults = async () => {
    const defaults = await productService.resetToDefault();
    setProducts(defaults);
    setDismissedReminders([]);
    storageService.removeItem(STORAGE_KEYS.DISMISSED_REMINDERS);
    showToast('Reset sample products to default', 'info');
  };

  return (
    <ProductContext.Provider
      value={{
        products: dynamicProducts,
        filteredProducts,
        reminders,
        stats,
        isLoading,
        searchQuery,
        activeFilter,
        selectedCategory,
        sortBy,
        setSearchQuery,
        setActiveFilter,
        setSelectedCategory,
        setSortBy,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        dismissReminder,
        restoreDefaults,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
