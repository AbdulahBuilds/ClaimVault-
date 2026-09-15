import { Request, Response, NextFunction } from '../types/http';
import { verifyToken, JwtPayload } from '../utils/security';
import { dbClient } from '../db/dbClient';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = (req.headers.authorization || req.headers['authorization']) as string | undefined;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication token is missing or invalid. Please provide Bearer token.',
    });
  }

  const token = authHeader.substring(7).trim();
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      error: 'InvalidToken',
      message: 'Token has expired or is invalid. Please log in again.',
    });
  }

  // Ensure user still exists in database
  const user = await dbClient.findUserById(payload.userId);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'UserNotFound',
      message: 'User associated with this token no longer exists.',
    });
  }

  req.user = payload;
  next();
};
