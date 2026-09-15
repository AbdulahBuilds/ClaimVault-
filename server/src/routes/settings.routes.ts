import { Router, Response } from '../types/http';
import { dbClient } from '../db/dbClient';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const settingsRouter = new Router();

settingsRouter.use(requireAuth);

/**
 * GET /api/settings
 * Fetch settings for current user
 */
settingsRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await dbClient.getSettingsByUserId(req.user!.userId);
    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'FetchSettingsFailed',
      message: err.message || 'Failed to retrieve settings.',
    });
  }
});

/**
 * PATCH /api/settings
 * Update settings
 */
settingsRouter.patch('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await dbClient.updateSettings(req.user!.userId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      settings: updated,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'UpdateSettingsFailed',
      message: err.message || 'Failed to update settings.',
    });
  }
});
