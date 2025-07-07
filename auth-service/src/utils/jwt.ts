// src/utils/jwt.ts
import jwt, { JwtPayload } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? '';

/**
 * Generate a JWT token with a flexible expiresIn option.
 * @param payload - the payload to sign (string, object, or Buffer)
 * @param expiresIn - expiry duration (e.g., '1h', 3600)
 * @returns signed JWT string
 */
export function signToken(
  payload: string | object | Buffer,
  expiresIn: number | string = '1h'
): string {
  // Cast to `any` here to satisfy SignOptions definition
  return jwt.sign(payload, SECRET as string, { expiresIn: expiresIn as any });
}

/**
 * Verify a JWT token, returning the decoded payload or null if invalid.
 * @param token - JWT string
 * @returns decoded payload or null
 */
export function verifyToken(token: string): JwtPayload | string | null {
  try {
    return jwt.verify(token, SECRET as string);
  } catch {
    return null;
  }
}

