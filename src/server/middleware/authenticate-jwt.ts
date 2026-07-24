import { Request, Response, NextFunction } from 'express';
import { verifyToken } from 'server/lib/jwt';
import { JWT_COOKIE_NAME } from 'server/constants/auth-config';

/** Reads + verifies the JWT cookie; if valid, sets req.user and calls next(). Rejects (401) otherwise. */
export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[JWT_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const payload = verifyToken(token);
    req.user = { userID: payload.userID, username: payload.username, roleID: payload.roleID };
    return next();
  } catch (err) {
    // Covers both expired and tampered/invalid tokens (jwt.verify throws for both).
    res.clearCookie(JWT_COOKIE_NAME);
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
}

/**
 * Same verification, but never rejects - populates req.user if a valid cookie is present,
 * otherwise leaves it undefined and calls next() regardless. Used on routes that behave
 * differently for guests vs logged-in users (e.g. GET /users/, GET /links, GET /pages)
 * without hard-requiring auth.
 */
export function populateUserIfPresent(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[JWT_COOKIE_NAME];
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    req.user = { userID: payload.userID, username: payload.username, roleID: payload.roleID };
  } catch {
    res.clearCookie(JWT_COOKIE_NAME);
  }
  next();
}
