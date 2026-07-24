import { signToken, JwtPayload } from 'server/lib/jwt';
import { JWT_COOKIE_NAME } from 'server/constants/auth-config';

/** Mints a real, valid JWT and returns a `Cookie` header value for supertest's `.set('Cookie', ...)`. */
export function makeAuthCookie(payload: JwtPayload): string {
  const token = signToken(payload);
  return `${JWT_COOKIE_NAME}=${token}`;
}
