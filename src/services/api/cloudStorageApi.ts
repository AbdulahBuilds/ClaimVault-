import { apiClient, ApiResponse } from './apiClient';

export interface CloudReceiptMetadata {
  id: string;
  userId: string;
  productId?: string;
  originalFileName: string;
  storedKey: string;
  cloudUrl: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  mimeType: string;
  bucket: string;
  uploadedAt: string;
  isEncrypted: boolean;
}

export interface StorageQuotaData {
  usedBytes: number;
  usedFormatted: string;
  maxBytes: number;
  maxFormatted: string;
  percentUsed: number;
  fileCount: number;
}

export const cloudStorageApi = {
  /**
   * Upload receipt to S3 Cloud Storage Vault
   */
  async uploadReceipt(params: {
    fileName: string;
    fileData: string; // Base64 data URI or remote image URL
    mimeType?: string;
    productId?: string;
    fileSize?: number;
  }): Promise<ApiResponse<{ file: CloudReceiptMetadata }>> {
    return apiClient.post<{ file: CloudReceiptMetadata }>('/storage/upload', params);
  },

  /**
   * Get secure time-limited signed access URL (15-minute expiry)
   */
  async getSignedUrl(fileId: string): Promise<ApiResponse<{ file: CloudReceiptMetadata; signedUrl: string; expiresIn: string }>> {
    return apiClient.get<{ file: CloudReceiptMetadata; signedUrl: string; expiresIn: string }>(`/storage/files/${fileId}`);
  },

  /**
   * Delete receipt from S3 Cloud Storage
   */
  async deleteReceipt(fileId: string): Promise<ApiResponse<{ fileId: string }>> {
    return apiClient.delete<{ fileId: string }>(`/storage/files/${fileId}`);
  },

  /**
   * Fetch current cloud storage quota metrics
   */
  async getQuota(): Promise<ApiResponse<{ quota: StorageQuotaData }>> {
    return apiClient.get<{ quota: StorageQuotaData }>('/storage/quota');
  },
};
