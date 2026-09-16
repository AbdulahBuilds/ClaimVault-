import { getSupabaseClient } from './supabaseClient';
import { Product, UserProfile } from '../types';
import { storageService, STORAGE_KEYS } from './storageService';

export class CloudSyncService {
  private isOnline = true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => { this.isOnline = true; });
      window.addEventListener('offline', () => { this.isOnline = false; });
    }
  }

  /**
   * Fetch all products for a specific user from Supabase Cloud
   */
  public async fetchUserProductsFromCloud(userEmail: string): Promise<Product[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase || !userEmail) return null;

    try {
      const normalizedEmail = userEmail.trim().toLowerCase();
      const { data, error } = await supabase
        .from('claimvault_products')
        .select('*')
        .eq('user_email', normalizedEmail)
        .order('updated_at', { ascending: false });

      if (error) {
        console.warn('[CloudSync] Fetch products error (table might need creation):', error.message);
        return null;
      }

      if (data && Array.isArray(data)) {
        const cloudProducts: Product[] = data.map((row) => {
          if (row.data && typeof row.data === 'object') {
            return {
              ...row.data,
              id: row.id || row.data.id,
            };
          }
          return {
            id: row.id,
            name: row.name || 'Untitled Product',
            brand: row.brand || '',
            model: row.model || '',
            category: row.category || 'Other',
            price: Number(row.price) || 0,
            currency: 'PKR',
            purchaseDate: row.purchase_date || new Date().toISOString().split('T')[0],
            storeName: row.store_name || '',
            warranty: row.warranty || {
              durationMonths: 12,
              durationLabel: '1 Year',
              startDate: new Date().toISOString().split('T')[0],
              expiryDate: new Date().toISOString().split('T')[0],
              status: 'safe',
              warrantyType: 'Manufacturer',
            },
            returnInfo: row.return_info || {
              hasReturnPeriod: false,
              returnDurationDays: 0,
              returnDeadline: new Date().toISOString().split('T')[0],
              status: 'expired',
            },
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || new Date().toISOString(),
          };
        });

        return cloudProducts;
      }
      return [];
    } catch (err) {
      console.warn('[CloudSync] Unexpected error fetching from cloud:', err);
      return null;
    }
  }

  /**
   * Upsert a product to Supabase Cloud
   */
  public async syncProductToCloud(product: Product, userEmail: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase || !userEmail) return false;

    try {
      const normalizedEmail = userEmail.trim().toLowerCase();
      const payload = {
        id: product.id,
        user_email: normalizedEmail,
        name: product.name,
        brand: product.brand || '',
        model: product.model || '',
        category: product.category || 'Other',
        price: product.price || 0,
        purchase_date: product.purchaseDate,
        warranty_expiry: product.warranty?.expiryDate,
        data: product,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('claimvault_products')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('[CloudSync] Product upsert error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[CloudSync] Sync product error:', err);
      return false;
    }
  }

  /**
   * Delete a product from Supabase Cloud
   */
  public async deleteProductFromCloud(productId: string, userEmail: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase || !productId) return false;

    try {
      const normalizedEmail = userEmail.trim().toLowerCase();
      const { error } = await supabase
        .from('claimvault_products')
        .delete()
        .eq('id', productId)
        .eq('user_email', normalizedEmail);

      if (error) {
        console.warn('[CloudSync] Product delete error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[CloudSync] Delete product error:', err);
      return false;
    }
  }

  /**
   * Sync user account credentials & profile to Supabase Cloud
   */
  public async syncUserToCloud(user: UserProfile, passwordHash?: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase || !user.email) return false;

    try {
      const normalizedEmail = user.email.trim().toLowerCase();
      const payload = {
        email: normalizedEmail,
        name: user.name,
        password_hash: passwordHash || 'synced_account',
        profile_data: user,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('claimvault_users')
        .upsert(payload, { onConflict: 'email' });

      if (error) {
        console.warn('[CloudSync] User sync error:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[CloudSync] Sync user error:', err);
      return false;
    }
  }

  /**
   * Fetch user account credentials & profile from Supabase Cloud
   */
  public async fetchUserFromCloud(email: string): Promise<{ user: UserProfile; passwordHash: string } | null> {
    const supabase = getSupabaseClient();
    if (!supabase || !email) return null;

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase
        .from('claimvault_users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        user: data.profile_data || {
          id: `user-${Date.now()}`,
          name: data.name || email.split('@')[0],
          email: normalizedEmail,
          currency: 'PKR',
          isPro: true,
          memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          notificationsEnabled: true,
          reminderLeadTimes: [30, 14, 7, 1],
        },
        passwordHash: data.password_hash || '',
      };
    } catch {
      return null;
    }
  }
}

export const cloudSyncService = new CloudSyncService();
