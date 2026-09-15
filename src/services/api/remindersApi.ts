import { apiClient, ApiResponse } from './apiClient';

export interface ApiReminder {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category: string;
  type: 'warranty_expiry' | 'return_deadline';
  targetDate: string;
  daysRemaining: number;
  status: 'urgent' | 'warning' | 'safe' | 'expired';
  title: string;
  subtitle: string;
}

export const remindersApi = {
  async getReminders(): Promise<ApiResponse<{ reminders: ApiReminder[] }>> {
    return apiClient.get<{ reminders: ApiReminder[] }>('/reminders');
  },
};
