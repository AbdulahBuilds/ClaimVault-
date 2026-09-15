import crypto from 'crypto';

export interface CloudFileMetadata {
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

export interface StorageQuota {
  usedBytes: number;
  usedFormatted: string;
  maxBytes: number;
  maxFormatted: string;
  percentUsed: number;
  fileCount: number;
}

const DEFAULT_BUCKET = process.env.S3_BUCKET_NAME || 'claimvault-production-vault';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const USER_QUOTA_BYTES = 500 * 1024 * 1024; // 500 MB per user
const SIGNED_URL_SECRET = process.env.SIGNED_URL_SECRET || 'claimvault_signed_url_token_secret_2026';

class CloudStorageService {
  private files: Map<string, CloudFileMetadata> = new Map();

  constructor() {
    this.seedDemoCloudReceipts();
  }

  private seedDemoCloudReceipts() {
    const demoFiles: CloudFileMetadata[] = [
      {
        id: 'cfile_samsung_s24',
        userId: 'usr_abdullah_pakistan_001',
        productId: 'prod_samsung_s24',
        originalFileName: 'Samsung_Invoice_INV98124.jpg',
        storedKey: 'vault/usr_abdullah_pakistan_001/2026/08/samsung_inv_98124_enc.jpg',
        cloudUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
        fileSizeBytes: 1887436,
        fileSizeFormatted: '1.8 MB',
        mimeType: 'image/jpeg',
        bucket: DEFAULT_BUCKET,
        uploadedAt: '2026-08-01T10:30:00.000Z',
        isEncrypted: true,
      },
      {
        id: 'cfile_dell_xps',
        userId: 'usr_abdullah_pakistan_001',
        productId: 'prod_dell_xps',
        originalFileName: 'Dell_XPS_Invoice_HC44120.jpg',
        storedKey: 'vault/usr_abdullah_pakistan_001/2026/06/dell_xps_hc44120_enc.jpg',
        cloudUrl: 'https://images.unsplash.com/photo-1554415707-9e4c018a482d?w=800&auto=format&fit=crop&q=80',
        fileSizeBytes: 2202009,
        fileSizeFormatted: '2.1 MB',
        mimeType: 'image/jpeg',
        bucket: DEFAULT_BUCKET,
        uploadedAt: '2026-06-15T12:00:00.000Z',
        isEncrypted: true,
      },
    ];

    demoFiles.forEach((f) => this.files.set(f.id, f));
  }

  /**
   * Validate file size and MIME type
   */
  private validateFile(mimeType: string, fileSizeBytes: number) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];
    if (!allowedMimes.includes(mimeType.toLowerCase())) {
      throw new Error(`Unsupported file type: ${mimeType}. Allowed formats: JPEG, PNG, WebP, PDF.`);
    }

    if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds 10 MB limit (${(fileSizeBytes / 1024 / 1024).toFixed(1)} MB).`);
    }
  }

  /**
   * Upload file to Cloud Storage Vault
   */
  async uploadFile(
    userId: string,
    params: {
      fileName: string;
      fileBase64OrUrl: string;
      mimeType?: string;
      productId?: string;
      fileSizeBytes?: number;
    }
  ): Promise<CloudFileMetadata> {
    const mimeType = params.mimeType || 'image/jpeg';
    const fileSizeBytes = params.fileSizeBytes || 1024 * 1024 * 1.5; // ~1.5 MB default

    this.validateFile(mimeType, fileSizeBytes);

    // Check user quota
    const quota = await this.getUserQuota(userId);
    if (quota.usedBytes + fileSizeBytes > quota.maxBytes) {
      throw new Error('Cloud storage quota exceeded (500 MB limit). Please delete old receipts.');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const fileId = `cfile_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const cleanName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedKey = `vault/${userId}/${year}/${month}/${fileId}_${cleanName}`;

    const metadata: CloudFileMetadata = {
      id: fileId,
      userId,
      productId: params.productId,
      originalFileName: params.fileName,
      storedKey,
      cloudUrl: params.fileBase64OrUrl.startsWith('data:') || params.fileBase64OrUrl.startsWith('http')
        ? params.fileBase64OrUrl
        : `https://storage.claimvault.pk/${DEFAULT_BUCKET}/${storedKey}`,
      fileSizeBytes,
      fileSizeFormatted: `${(fileSizeBytes / 1024 / 1024).toFixed(1)} MB`,
      mimeType,
      bucket: DEFAULT_BUCKET,
      uploadedAt: now.toISOString(),
      isEncrypted: true,
    };

    this.files.set(fileId, metadata);
    return metadata;
  }

  /**
   * Generate temporary signed access URL with 15-minute TTL
   */
  generateSignedUrl(file: CloudFileMetadata, expiresInSeconds = 900): string {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const signature = crypto
      .createHmac('sha256', SIGNED_URL_SECRET)
      .update(`${file.id}:${file.userId}:${expiresAt}`)
      .digest('hex');

    return `${file.cloudUrl}${file.cloudUrl.includes('?') ? '&' : '?'}exp=${expiresAt}&sig=${signature}`;
  }

  /**
   * Get file metadata with user ownership access control
   */
  async getFile(fileId: string, requestingUserId: string): Promise<{ file: CloudFileMetadata; signedUrl: string }> {
    const file = this.files.get(fileId);
    if (!file) {
      throw new Error('Receipt file not found.');
    }

    // Access control check: user must own the receipt
    if (file.userId !== requestingUserId) {
      const err: any = new Error('Access denied: You do not have permission to access this private receipt.');
      err.statusCode = 403;
      throw err;
    }

    const signedUrl = this.generateSignedUrl(file);
    return { file: { ...file }, signedUrl };
  }

  /**
   * Delete file from cloud storage
   */
  async deleteFile(fileId: string, requestingUserId: string): Promise<boolean> {
    const file = this.files.get(fileId);
    if (!file) return false;

    if (file.userId !== requestingUserId) {
      const err: any = new Error('Access denied: You do not own this receipt.');
      err.statusCode = 403;
      throw err;
    }

    return this.files.delete(fileId);
  }

  /**
   * Get user storage quota
   */
  async getUserQuota(userId: string): Promise<StorageQuota> {
    let usedBytes = 0;
    let fileCount = 0;

    for (const f of this.files.values()) {
      if (f.userId === userId) {
        usedBytes += f.fileSizeBytes;
        fileCount++;
      }
    }

    return {
      usedBytes,
      usedFormatted: `${(usedBytes / 1024 / 1024).toFixed(1)} MB`,
      maxBytes: USER_QUOTA_BYTES,
      maxFormatted: `${(USER_QUOTA_BYTES / 1024 / 1024).toFixed(0)} MB`,
      percentUsed: Math.min(100, Math.round((usedBytes / USER_QUOTA_BYTES) * 100)),
      fileCount,
    };
  }
}

export const cloudStorageService = new CloudStorageService();
