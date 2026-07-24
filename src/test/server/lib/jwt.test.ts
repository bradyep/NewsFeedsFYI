import { signToken, verifyToken, JwtPayload } from '../../../server/lib/jwt';

describe('jwt', () => {
  const payload: JwtPayload = { userID: 1, username: 'testuser', roleID: 3 };

  it('should round-trip a signed token through verifyToken', () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.userID).toBe(payload.userID);
    expect(decoded.username).toBe(payload.username);
    expect(decoded.roleID).toBe(payload.roleID);
  });

  it('should throw when verifying a tampered token', () => {
    const token = signToken(payload);
    // Flip a character in the signature segment to invalidate it
    const parts = token.split('.');
    const tamperedSignature = parts[2].slice(0, -1) + (parts[2].slice(-1) === 'A' ? 'B' : 'A');
    const tampered = [parts[0], parts[1], tamperedSignature].join('.');

    expect(() => verifyToken(tampered)).toThrow();
  });

  it('should throw when verifying a garbage string', () => {
    expect(() => verifyToken('not-a-real-jwt')).toThrow();
  });

  it('should throw when verifying an expired token', () => {
    // jsonwebtoken accepts a custom expiresIn only through sign(); simulate an
    // already-expired token by signing with a negative expiry.
    const jwt = require('jsonwebtoken');
    const expired = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: -10 });

    expect(() => verifyToken(expired)).toThrow();
  });
});
