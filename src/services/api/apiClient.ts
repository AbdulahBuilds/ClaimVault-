import { storageService } from '../storageService';

const BACKEND_API_BASE = 'http://localhost:5000/api';
const TOKEN_STORAGE_KEY = 'claimvault_auth_token_v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string = BACKEND_API_BASE;
  private token: string | null = null;
  private isOnline: boolean | null = null;

  constructor() {
    this.token = storageService.getItem<string>(TOKEN_STORAGE_KEY, null);
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      storageService.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      storageService.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = storageService.getItem<string>(TOKEN_STORAGE_KEY, null);
    }
    return this.token;
  }

  /**
   * Check if backend server is online & reachable
   */
  async checkHealth(): Promise<{ online: boolean; latencyMs: number; data?: any }> {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        this.isOnline = true;
        return { online: true, latencyMs, data };
      }
      this.isOnline = false;
      return { online: false, latencyMs, data: null };
    } catch {
      this.isOnline = false;
      return { online: false, latencyMs: 0 };
    }
  }

  getIsOnlineCached(): boolean {
    return this.isOnline ?? false;
  }

  /**
   * Generic request method with JWT auth header
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${res.status}`,
          message: data.message || 'Request failed.',
          status: res.status,
        };
      }

      return data;
    } catch (err: any) {
      return {
        success: false,
        error: 'NetworkError',
        message: err.name === 'AbortError' ? 'Request timed out.' : 'Failed to connect to ClaimVault API.',
      };
    }
  }

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
