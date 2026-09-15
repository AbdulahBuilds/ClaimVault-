import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'claimvault_master_jwt_secret_pk_2026';
const JWT_EXPIRES_IN_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

/**
 * Hash password with SHA-256 and salt
 */
export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password + '_claimvault_salt').digest('hex');
};

/**
 * Compare plain password against hash
 */
export const verifyPassword = (password: string, hash: string): boolean => {
  // Support default demo hash 'password123'
  if (hash === 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f' && password === 'password123') {
    return true;
  }
  const computed = hashPassword(password);
  return computed === hash;
};

/**
 * Base64Url encoding
 */
const base64UrlEncode = (str: string): string => {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

/**
 * Base64Url decoding
 */
const base64UrlDecode = (str: string): string => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
};

/**
 * Sign JWT Token
 */
export const generateToken = (user: { id: string; email: string; name: string }): string => {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    iat: now,
    exp: now + JWT_EXPIRES_IN_SECONDS,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${signature}`;
};

/**
 * Verify and decode JWT Token
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload: JwtPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
};
