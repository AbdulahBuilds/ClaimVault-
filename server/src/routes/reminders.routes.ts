import { Router, Response } from '../types/http';
import { dbClient } from '../db/dbClient';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const remindersRouter = new Router();

remindersRouter.use(requireAuth);

/**
 * Helper to compute days difference
 */
const getDaysDifference = (targetDate: string): number => {
  const target = new Date(targetDate);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * GET /api/reminders
 * Automatically generate reminders based on product deadlines
 */
remindersRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const products = await dbClient.getProductsByUserId(userId);

    const reminders: any[] = [];

    products.forEach((p) => {
      // 1. Warranty Expiry Reminder
      const daysUntilWarranty = getDaysDifference(p.warrantyExpiryDate);
      let warrantyStatus: 'urgent' | 'warning' | 'safe' | 'expired' = 'safe';
      if (daysUntilWarranty < 0) warrantyStatus = 'expired';
      else if (daysUntilWarranty <= 7) warrantyStatus = 'urgent';
      else if (daysUntilWarranty <= 30) warrantyStatus = 'warning';

      reminders.push({
        id: `rem_war_${p.id}`,
        productId: p.id,
        productName: p.name,
        brand: p.brand,
        category: p.category,
        type: 'warranty_expiry',
        targetDate: p.warrantyExpiryDate,
        daysRemaining: daysUntilWarranty,
        status: warrantyStatus,
        title: daysUntilWarranty < 0 
          ? `Warranty Expired on ${p.name}` 
          : `Warranty Expires in ${daysUntilWarranty} days`,
        subtitle: `${p.warrantyDurationLabel} • ${p.storeName}`,
      });

      // 2. Return Deadline Reminder
      if (p.hasReturnPeriod && p.returnDeadline) {
        const daysUntilReturn = getDaysDifference(p.returnDeadline);
        let returnStatus: 'urgent' | 'warning' | 'safe' | 'expired' = 'safe';
        if (daysUntilReturn < 0) returnStatus = 'expired';
        else if (daysUntilReturn <= 3) returnStatus = 'urgent';
        else if (daysUntilReturn <= 7) returnStatus = 'warning';

        reminders.push({
          id: `rem_ret_${p.id}`,
          productId: p.id,
          productName: p.name,
          brand: p.brand,
          category: p.category,
          type: 'return_deadline',
          targetDate: p.returnDeadline,
          daysRemaining: daysUntilReturn,
          status: returnStatus,
          title: daysUntilReturn < 0
            ? `Return Window Closed for ${p.name}`
            : daysUntilReturn === 0
            ? `Return Deadline Today for ${p.name}`
            : `Return Window Ends in ${daysUntilReturn} days`,
          subtitle: `${p.returnDurationDays} Days Policy • ${p.storeName}`,
        });
      }
    });

    // Sort by urgent first, then days remaining ascending
    reminders.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'FetchRemindersFailed',
      message: err.message || 'Failed to generate reminders.',
    });
  }
});
