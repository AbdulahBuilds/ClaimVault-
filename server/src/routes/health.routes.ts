import { Router, Request, Response } from '../types/http';
import { dbClient } from '../db/dbClient';

export const healthRouter = new Router();

/**
 * GET /api/health
 * Public health check & diagnostics endpoint
 */
healthRouter.get('/', async (req: Request, res: Response) => {
  const stats = await dbClient.getStats();
  return res.status(200).json({
    status: 'ok',
    service: 'ClaimVault Master Backend API',
    version: '1.0.0',
    region: 'PK-South (Karachi/Lahore)',
    environment: process.env.NODE_ENV || 'development',
    database: stats.database,
    uptimeSeconds: Math.floor(stats.uptimeSeconds),
    timestamp: stats.timestamp,
    metrics: {
      registeredUsers: stats.userCount,
      storedProducts: stats.productCount,
      attachedReceipts: stats.receiptCount,
    },
  });
});
