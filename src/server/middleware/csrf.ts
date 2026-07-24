import { doubleCsrf } from 'csrf-csrf';
import crypto = require('crypto');
import { Request, Response, NextFunction } from 'express';
import { CSRF_COOKIE_NAME } from 'server/constants/auth-config';

const CSRF_SESSION_ID_COOKIE_NAME = 'nffyi_csid';

const secret = process.env.CSRF_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('CSRF_SECRET environment variable is required in production.');
}
if (!secret) {
  console.warn('[auth] CSRF_SECRET is not set — using an insecure development-only default. Set CSRF_SECRET in .env.');
}

/**
 * csrf-csrf's double-submit pattern binds each token to a "session identifier" to prevent
 * cookie-tossing/fixation attacks. This app has no server-side session store (auth is a
 * stateless JWT), so we mint our own anonymous, httpOnly identifier cookie on first visit
 * and reuse it for the life of the browser session.
 */
export function ensureCsrfSessionId(req: Request, res: Response, next: NextFunction) {
  let sessionId = req.cookies?.[CSRF_SESSION_ID_COOKIE_NAME];
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    res.cookie(CSRF_SESSION_ID_COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });
    // The browser won't echo this cookie back until the *next* request - make it available
    // to this request's doubleCsrfProtection/generateCsrfToken call immediately.
    req.cookies[CSRF_SESSION_ID_COOKIE_NAME] = sessionId;
  }
  next();
}

const {
  doubleCsrfProtection,
  generateCsrfToken,
  invalidCsrfTokenError
} = doubleCsrf({
  getSecret: () => secret || 'dev-only-insecure-csrf-secret',
  getSessionIdentifier: (req) => req.cookies?.[CSRF_SESSION_ID_COOKIE_NAME],
  cookieName: CSRF_COOKIE_NAME,
  cookieOptions: {
    httpOnly: false, // must be readable by client JS - it echoes the token back in a header
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  },
  size: 64,
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token']
});

export { doubleCsrfProtection, generateCsrfToken, invalidCsrfTokenError };
