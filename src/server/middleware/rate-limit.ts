import rateLimit from 'express-rate-limit';

/** Login attempts. A legitimate user might mistype their password a few times in a few minutes. */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' }
});

/** New account creation. A legitimate user will essentially never create 5 accounts from one IP in an hour. */
export const signupRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                   // 5 signups per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many accounts created from this IP. Please try again later.' }
});
