import { apiClient, ApiResponse } from './apiClient';

export interface ApiSettings {
  userId: string;
  currency: string;
  pushEnabled: boolean;
  soundEnabled: boolean;
  timingRules: {
    before30Days: boolean;
    before14Days: boolean;
    before7Days: boolean;
    before3Days: boolean;
    before1Day: boolean;
    onDeadline: boolean;
  };
  updatedAt: string;
}

export const settingsApi = {
  async getSettings(): Promise<ApiResponse<{ settings: ApiSettings }>> {
    return apiClient.get<{ settings: ApiSettings }>('/settings');
  },

  async updateSettings(updates: Partial<ApiSettings>): Promise<ApiResponse<{ settings: ApiSettings }>> {
    return apiClient.patch<{ settings: ApiSettings }>('/settings', updates);
  },
};
