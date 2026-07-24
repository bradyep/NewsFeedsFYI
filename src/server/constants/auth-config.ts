// Server-only auth configuration. Not shared with the client (JWT signing/verification
// only ever happens server-side).

const DEFAULT_JWT_EXPIRY_DAYS = 30;

function parseExpiryDays(): number {
  const raw = process.env.JWT_EXPIRY_DAYS;
  if (!raw) return DEFAULT_JWT_EXPIRY_DAYS;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_JWT_EXPIRY_DAYS;
}

/** Number of days a login session (JWT + cookie) remains valid. Override via JWT_EXPIRY_DAYS env var. */
export const JWT_EXPIRY_DAYS: number = parseExpiryDays();

/** Same value in milliseconds, for cookie `maxAge`. */
export const JWT_EXPIRY_MS: number = JWT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

/** Same value in seconds, for jsonwebtoken's `expiresIn` (accepts a number of seconds). */
export const JWT_EXPIRY_SECONDS: number = JWT_EXPIRY_DAYS * 24 * 60 * 60;

/** Name of the httpOnly cookie carrying the JWT. */
export const JWT_COOKIE_NAME = 'nffyi_token';

/** Name of the non-httpOnly cookie carrying the CSRF token value (readable by client JS). */
export const CSRF_COOKIE_NAME = 'nffyi_csrf';

/** bcrypt salt rounds for password hashing. */
export const BCRYPT_SALT_ROUNDS = 10;
