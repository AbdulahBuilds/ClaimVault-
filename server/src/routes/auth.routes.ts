import { Router, Response } from '../types/http';
import { dbClient } from '../db/dbClient';
import { hashPassword, verifyPassword, generateToken } from '../utils/security';
import { validateRegister, validateLogin } from '../middleware/validation';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const authRouter = new Router();

/**
 * POST /api/auth/register
 * Register a new user account
 */
authRouter.post('/register', validateRegister, async (req, res: Response) => {
  try {
    const { name, email, password, currency = 'PKR' } = req.body;

    const existing = await dbClient.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'EmailConflict',
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = hashPassword(password);
    const newUser = await dbClient.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      currency,
      isPro: false,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0F8B8D&color=fff&bold=true`,
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        currency: newUser.currency,
        isPro: newUser.isPro,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'RegistrationFailed',
      message: err.message || 'Failed to create user account.',
    });
  }
});

/**
 * POST /api/auth/login
 * Log in an existing user
 */
authRouter.post('/login', validateLogin, async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await dbClient.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'InvalidCredentials',
        message: 'Incorrect email or password. Please try again.',
      });
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'InvalidCredentials',
        message: 'Incorrect email or password. Please try again.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        currency: user.currency,
        isPro: user.isPro,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'LoginFailed',
      message: err.message || 'Failed to process login.',
    });
  }
});

/**
 * GET /api/auth/me
 * Fetch profile for current authenticated user
 */
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await dbClient.findUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'UserNotFound',
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        currency: user.currency,
        isPro: user.isPro,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'FetchProfileFailed',
      message: err.message || 'Failed to retrieve user profile.',
    });
  }
});
