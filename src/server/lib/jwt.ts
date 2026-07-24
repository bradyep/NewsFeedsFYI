import jwt = require('jsonwebtoken');
import { JWT_EXPIRY_SECONDS } from 'server/constants/auth-config';

export interface JwtPayload {
  userID: number;
  username: string;
  roleID: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    // Fail fast: never silently run production auth with a guessable/absent secret.
    throw new Error('JWT_SECRET environment variable is required in production.');
  }
  // Dev-only fallback so `npm run startbackend*` still works without a .env file present,
  // but loudly warns so it's never mistaken for "just works, no config needed."
  console.warn('[auth] JWT_SECRET is not set — using an insecure development-only default. Set JWT_SECRET in .env.');
  return 'dev-only-insecure-secret-do-not-use-in-production';
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRY_SECONDS });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}
