import express = require("express");
export var router = express.Router();
import usersModel = require('server/sequelize/users-sequelize');
import logModule = require('debug');
const debug = logModule('nffyi-rest:router-authenticate');
const error = debug('nffyi-rest:error');
import { signToken } from 'server/lib/jwt';
import { JWT_COOKIE_NAME, JWT_EXPIRY_MS } from 'server/constants/auth-config';
import { authRateLimiter } from 'server/middleware/rate-limit';
import { generateCsrfToken } from 'server/middleware/csrf';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // dev over http://localhost is fine with secure:false
    sameSite: 'lax' as const,                       // survives top-level nav + same-site XHR; CSRF risk is covered separately
    maxAge: JWT_EXPIRY_MS,
    path: '/'
  };
}

router.post('/', authRateLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const checkReturn = await usersModel.userPasswordCheck(username, password);
    if (!checkReturn.check) {
      return res.status(401).json({ message: checkReturn.message ?? 'Authentication failed' });
    }
    const token = signToken({ userID: checkReturn.userid, username: checkReturn.username, roleID: checkReturn.roleid });
    res.cookie(JWT_COOKIE_NAME, token, cookieOptions());
    return res.status(200).json({ userID: checkReturn.userid, username: checkReturn.username, roleID: checkReturn.roleid });
  } catch (err) {
    return next(err);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie(JWT_COOKIE_NAME, { path: '/' });
  res.status(200).json({ message: 'Logged out' });
});

/** Bootstrap endpoint - client fetches this once at boot to obtain the CSRF token it must
 *  echo back (via the X-CSRF-Token header) on every mutating request, including login/signup. */
router.get('/csrf-token', (req, res) => {
  const token = generateCsrfToken(req, res);
  res.status(200).json({ csrfToken: token });
});
