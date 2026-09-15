import { Request, Response, NextFunction } from '../types/http';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Name must be at least 2 characters long.',
    });
  }

  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'A valid email address is required.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Password must be at least 6 characters long.',
    });
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Email and password are both required.',
    });
  }

  next();
};

export const validateProduct = (req: Request, res: Response, next: NextFunction) => {
  const { name, brand, price, purchaseDate, storeName } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Product name is required.',
    });
  }

  if (!brand || typeof brand !== 'string' || !brand.trim()) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Brand is required.',
    });
  }

  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'A valid non-negative price is required.',
    });
  }

  if (!purchaseDate || typeof purchaseDate !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Valid purchase date is required (YYYY-MM-DD).',
    });
  }

  if (!storeName || typeof storeName !== 'string' || !storeName.trim()) {
    return res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Store name is required.',
    });
  }

  next();
};
