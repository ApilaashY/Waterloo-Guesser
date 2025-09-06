// @ts-ignore
import { generateKeys, sign, verify } from 'paseto-ts/v4';

// Environment variables for keys (should be set in .env)
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;
const AUTH_PUBLIC_KEY = process.env.AUTH_PUBLIC_KEY;

// Generate keys if not provided (for development only)
let secretKey: string;
let publicKey: string;

if (AUTH_SECRET_KEY && AUTH_PUBLIC_KEY) {
  secretKey = AUTH_SECRET_KEY;
  publicKey = AUTH_PUBLIC_KEY;
} else {
  console.warn('AUTH_SECRET_KEY and AUTH_PUBLIC_KEY not found in environment variables. Generating temporary keys for development.');
  const keys = generateKeys('public');
  secretKey = keys.secretKey;
  publicKey = keys.publicKey;
  console.log('Generated temporary secret key:', secretKey);
  console.log('Generated temporary public key:', publicKey);
}

export interface UserPayload {
  id: string;
  ref: string;
  email: string;
  username: string;
  department: string;
  waterlooUsername?: string;
}

export interface SessionPayload extends UserPayload {
  iat: string;
  exp: string;
  iss: string;
  sub: string;
}

/**
 * Generate a PASETO token for a user session
 */
export async function generateSessionToken(user: UserPayload, expiresIn: string = '24h'): Promise<string> {
  const now = new Date();
  const expiration = new Date();
  
  // Parse expiration time (simple parser for common formats)
  if (expiresIn.endsWith('h')) {
    const hours = parseInt(expiresIn.slice(0, -1));
    expiration.setHours(expiration.getHours() + hours);
  } else if (expiresIn.endsWith('d')) {
    const days = parseInt(expiresIn.slice(0, -1));
    expiration.setDate(expiration.getDate() + days);
  } else if (expiresIn.endsWith('m')) {
    const minutes = parseInt(expiresIn.slice(0, -1));
    expiration.setMinutes(expiration.getMinutes() + minutes);
  } else {
    // Default to 24 hours
    expiration.setHours(expiration.getHours() + 24);
  }

  const payload: Omit<SessionPayload, 'iat' | 'exp'> = {
    ...user,
    iss: 'uwguesser',
    sub: user.id
  };

  try {
    const token = await sign(secretKey, payload, {
      addIat: true,
      addExp: true,
      footer: JSON.stringify({ app: 'uwguesser', version: '1.0' })
    });
    
    return token;
  } catch (error) {
    console.error('Error generating PASETO token:', error);
    throw new Error('Failed to generate session token');
  }
}

/**
 * Verify and decode a PASETO token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const result = await verify(publicKey, token, {
      validatePayload: true
    });
    
    return result.payload as SessionPayload;
  } catch (error) {
    console.error('Error verifying PASETO token:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header or cookies
 */
export function extractTokenFromRequest(request: Request): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies as fallback
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    return cookies.session || null;
  }

  return null;
}

/**
 * Middleware function to verify user session
 */
export async function verifySession(request: Request): Promise<{ 
  isAuthenticated: boolean; 
  user: SessionPayload | null; 
  error?: string 
}> {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    return { isAuthenticated: false, user: null, error: 'No token provided' };
  }

  const user = await verifySessionToken(token);
  
  if (!user) {
    return { isAuthenticated: false, user: null, error: 'Invalid or expired token' };
  }

  return { isAuthenticated: true, user };
}

/**
 * Generate secure cookie options for session token
 */
export function getSecureCookieOptions(isProduction: boolean = process.env.NODE_ENV === 'production') {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    path: '/'
  };
}
