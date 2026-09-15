import { apiClient, ApiResponse } from './apiClient';
import { Product } from '../../types';

export const productsApi = {
  async getProducts(category?: string, search?: string): Promise<ApiResponse<{ products: Product[] }>> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search && search.trim()) params.append('search', search.trim());

    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<{ products: Product[] }>(`/products${qs}`);
  },

  async getProductById(id: string): Promise<ApiResponse<{ product: Product }>> {
    return apiClient.get<{ product: Product }>(`/products/${id}`);
  },

  async createProduct(productData: Partial<Product>): Promise<ApiResponse<{ product: Product }>> {
    return apiClient.post<{ product: Product }>('/products', productData);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<ApiResponse<{ product: Product }>> {
    return apiClient.patch<{ product: Product }>(`/products/${id}`, updates);
  },

  async deleteProduct(id: string): Promise<ApiResponse<{ productId: string }>> {
    return apiClient.delete<{ productId: string }>(`/products/${id}`);
  },
};
