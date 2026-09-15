import { Router, Response } from '../types/http';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { cloudStorageService } from '../services/cloudStorageService';
import { dbClient } from '../db/dbClient';

export const storageRouter = new Router();

storageRouter.use(requireAuth);

/**
 * POST /api/storage/upload
 * Upload receipt image to Cloud Object Storage
 */
storageRouter.post('/upload', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { fileName, fileData, mimeType = 'image/jpeg', productId, fileSize } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'File name and file content are required.',
      });
    }

    const uploaded = await cloudStorageService.uploadFile(userId, {
      fileName,
      fileBase64OrUrl: fileData,
      mimeType,
      productId,
      fileSizeBytes: fileSize ? Number(fileSize) : undefined,
    });

    // If attached to a product, update product record
    if (productId) {
      await dbClient.updateProduct(productId, userId, {
        receipt: {
          id: uploaded.id,
          productId,
          userId,
          fileName: uploaded.originalFileName,
          imageUrl: uploaded.cloudUrl,
          fileSize: uploaded.fileSizeFormatted,
          mimeType: uploaded.mimeType,
          uploadedAt: uploaded.uploadedAt,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Receipt uploaded to S3 Cloud Vault with AES-256 encryption.',
      file: uploaded,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: 'UploadFailed',
      message: err.message || 'Failed to upload receipt to cloud storage.',
    });
  }
});

/**
 * GET /api/storage/files/:id
 * Retrieve signed access URL for private receipt
 */
storageRouter.get('/files/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const fileId = req.params.id;

    const result = await cloudStorageService.getFile(fileId, userId);

    return res.status(200).json({
      success: true,
      file: result.file,
      signedUrl: result.signedUrl,
      expiresIn: '15 minutes',
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: err.statusCode === 403 ? 'Forbidden' : 'FileNotFound',
      message: err.message || 'Failed to retrieve receipt.',
    });
  }
});

/**
 * DELETE /api/storage/files/:id
 * Delete receipt from cloud storage
 */
storageRouter.delete('/files/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const fileId = req.params.id;

    const deleted = await cloudStorageService.deleteFile(fileId, userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'FileNotFound',
        message: 'File not found or already removed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Receipt removed from cloud storage.',
      fileId,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      error: err.statusCode === 403 ? 'Forbidden' : 'DeleteFailed',
      message: err.message || 'Failed to delete receipt from cloud storage.',
    });
  }
});

/**
 * GET /api/storage/quota
 * Fetch user cloud storage consumption
 */
storageRouter.get('/quota', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const quota = await cloudStorageService.getUserQuota(userId);

    return res.status(200).json({
      success: true,
      quota,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'QuotaFetchFailed',
      message: err.message || 'Failed to retrieve storage quota.',
    });
  }
});
