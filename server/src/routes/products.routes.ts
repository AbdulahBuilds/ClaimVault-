import { Router, Response } from '../types/http';
import { dbClient } from '../db/dbClient';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { validateProduct } from '../middleware/validation';
import { DbProduct } from '../db/seedData';

export const productsRouter = new Router();

// Protect all product routes with requireAuth
productsRouter.use(requireAuth);

/**
 * GET /api/products
 * List products for current user
 */
productsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    const products = await dbClient.getProductsByUserId(req.user!.userId, category, search);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'FetchProductsFailed',
      message: err.message || 'Failed to retrieve products.',
    });
  }
});

/**
 * GET /api/products/:id
 * Retrieve single product
 */
productsRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const product = await dbClient.getProductById(req.params.id, req.user!.userId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'ProductNotFound',
        message: 'Product not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'FetchProductFailed',
      message: err.message || 'Failed to retrieve product details.',
    });
  }
});

/**
 * POST /api/products
 * Create a new product
 */
productsRouter.post('/', validateProduct, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const body = req.body;

    const productPayload: Omit<DbProduct, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      name: body.name.trim(),
      brand: body.brand.trim(),
      model: body.model?.trim() || 'Standard Edition',
      category: body.category || 'Electronics',
      price: Number(body.price),
      currency: body.currency || 'PKR',
      purchaseDate: body.purchaseDate,
      storeName: body.storeName.trim(),
      storeLocation: body.storeLocation?.trim(),
      invoiceNumber: body.invoiceNumber?.trim(),
      imageUrl: body.imageUrl,
      notes: body.notes?.trim(),
      
      // Warranty
      warrantyDurationMonths: Number(body.warrantyDurationMonths || 12),
      warrantyDurationLabel: body.warrantyDurationLabel || '1 Year',
      warrantyStartDate: body.warrantyStartDate || body.purchaseDate,
      warrantyExpiryDate: body.warrantyExpiryDate,
      warrantyType: body.warrantyType || 'Manufacturer',
      warrantyProvider: body.warrantyProvider?.trim(),

      // Return
      hasReturnPeriod: body.hasReturnPeriod !== undefined ? Boolean(body.hasReturnPeriod) : true,
      returnDurationDays: Number(body.returnDurationDays || 7),
      returnDeadline: body.returnDeadline,

      receipt: body.receipt
        ? {
            id: body.receipt.id || `rcpt_${Date.now()}`,
            productId: '', // assigned in client
            userId,
            fileName: body.receipt.fileName || 'Receipt.jpg',
            imageUrl: body.receipt.imageUrl,
            fileSize: body.receipt.fileSize || '1.5 MB',
            mimeType: body.receipt.mimeType || 'image/jpeg',
            uploadedAt: body.receipt.uploadedAt || new Date().toISOString(),
          }
        : undefined,
    };

    const created = await dbClient.createProduct(productPayload);

    return res.status(201).json({
      success: true,
      message: 'Product added to ClaimVault vault.',
      product: created,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'CreateProductFailed',
      message: err.message || 'Failed to save new product.',
    });
  }
});

/**
 * PATCH /api/products/:id
 * Update product fields
 */
productsRouter.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const productId = req.params.id;

    const existing = await dbClient.getProductById(productId, userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'ProductNotFound',
        message: 'Product not found or access denied.',
      });
    }

    const updated = await dbClient.updateProduct(productId, userId, req.body);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'UpdateProductFailed',
      message: err.message || 'Failed to update product.',
    });
  }
});

/**
 * DELETE /api/products/:id
 * Delete product and attached receipts
 */
productsRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const productId = req.params.id;

    const deleted = await dbClient.deleteProduct(productId, userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'ProductNotFound',
        message: 'Product not found or already removed.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product removed from ClaimVault vault.',
      productId,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'DeleteProductFailed',
      message: err.message || 'Failed to delete product.',
    });
  }
});
