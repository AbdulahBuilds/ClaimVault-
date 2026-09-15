import { Router, Response } from '../types/http';
import { dbClient } from '../db/dbClient';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const receiptsRouter = new Router();

receiptsRouter.use(requireAuth);

/**
 * GET /api/receipts
 * List all receipts for user
 */
receiptsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const receipts = await dbClient.getReceiptsByUserId(req.user!.userId);
    return res.status(200).json({
      success: true,
      count: receipts.length,
      receipts,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'FetchReceiptsFailed',
      message: err.message || 'Failed to retrieve receipts.',
    });
  }
});

/**
 * POST /api/receipts
 * Attach or upload receipt metadata
 */
receiptsRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { productId, fileName, imageUrl, fileSize = '1.5 MB', mimeType = 'image/jpeg' } = req.body;

    if (!productId || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'ValidationError',
        message: 'Product ID and image URL are required.',
      });
    }

    const prod = await dbClient.getProductById(productId, userId);
    if (!prod) {
      return res.status(404).json({
        success: false,
        error: 'ProductNotFound',
        message: 'Product not found.',
      });
    }

    const newReceipt = {
      id: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      userId,
      fileName: fileName || 'Receipt.jpg',
      imageUrl,
      fileSize,
      mimeType,
      uploadedAt: new Date().toISOString(),
    };

    await dbClient.addReceipt(newReceipt);
    await dbClient.updateProduct(productId, userId, { receipt: newReceipt });

    return res.status(201).json({
      success: true,
      message: 'Receipt attached successfully.',
      receipt: newReceipt,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'UploadReceiptFailed',
      message: err.message || 'Failed to attach receipt.',
    });
  }
});

/**
 * DELETE /api/receipts/:id
 * Delete receipt
 */
receiptsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = await dbClient.deleteReceipt(req.params.id, req.user!.userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'ReceiptNotFound',
        message: 'Receipt not found or already deleted.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Receipt deleted successfully.',
      receiptId: req.params.id,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'DeleteReceiptFailed',
      message: err.message || 'Failed to delete receipt.',
    });
  }
});
