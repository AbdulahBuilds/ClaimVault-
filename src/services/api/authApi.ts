import { apiClient, ApiResponse } from './apiClient';
import { User } from '../../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  async register(name: string, email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const res = await apiClient.post<AuthResponse>('/auth/register', { name, email, password });
    if (res.success && res.token) {
      apiClient.setToken(res.token);
    }
    return res;
  },

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    if (res.success && res.token) {
      apiClient.setToken(res.token);
    }
    return res;
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get<{ user: User }>('/auth/me');
  },

  logout() {
    apiClient.setToken(null);
  },
};
