import { Request, Response, NextFunction } from 'express';
import { populateUserIfPresent } from '../../../server/middleware/authenticate-jwt';
import { signToken } from '../../../server/lib/jwt';
import { JWT_COOKIE_NAME } from '../../../server/constants/auth-config';

function makeRes() {
  const res: any = {};
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('populateUserIfPresent', () => {
  it('should call next() without setting req.user when no cookie is present', () => {
    const req = { cookies: {} } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    populateUserIfPresent(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it('should populate req.user when a valid cookie is present', () => {
    const token = signToken({ userID: 7, username: 'someone', roleID: 3 });
    const req = { cookies: { [JWT_COOKIE_NAME]: token } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    populateUserIfPresent(req, res, next);

    expect(req.user).toEqual({ userID: 7, username: 'someone', roleID: 3 });
    expect(next).toHaveBeenCalledWith();
  });

  it('should clear the cookie and continue (not reject) when the cookie is invalid', () => {
    const req = { cookies: { [JWT_COOKIE_NAME]: 'garbage' } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    populateUserIfPresent(req, res, next);

    expect(req.user).toBeUndefined();
    expect(res.clearCookie).toHaveBeenCalledWith(JWT_COOKIE_NAME);
    expect(next).toHaveBeenCalledWith();
  });
});
