import { Request, Response, NextFunction } from 'express';
import { isOwnerOrAdmin } from '../../../server/middleware/authorize';
import { Roles } from '../../../common/constants';

function makeRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('isOwnerOrAdmin', () => {
  it('should call next() when the requester owns the resource', async () => {
    const req = { user: { userID: 5, roleID: Roles.USER } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    const middleware = isOwnerOrAdmin(() => 5);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(); // called with no error
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should call next() for an admin regardless of ownership', async () => {
    const req = { user: { userID: 5, roleID: Roles.ADMIN } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    const middleware = isOwnerOrAdmin(() => 999);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should call next(err) with status 403 when the requester neither owns the resource nor is admin', async () => {
    const req = { user: { userID: 5, roleID: Roles.USER } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    const middleware = isOwnerOrAdmin(() => 999);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
  });

  it('should return 401 when req.user is not set', async () => {
    const req = { user: undefined } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    const middleware = isOwnerOrAdmin(() => 5);
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next() (pass-through) when the resolved owner is undefined, leaving 404 handling to the route', async () => {
    const req = { user: { userID: 5, roleID: Roles.USER } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    const middleware = isOwnerOrAdmin(() => undefined);
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should support an async getOwnerUserID resolver', async () => {
    const req = { user: { userID: 5, roleID: Roles.USER } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    const middleware = isOwnerOrAdmin(async () => Promise.resolve(5));
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should call next(err) when the getOwnerUserID resolver throws', async () => {
    const req = { user: { userID: 5, roleID: Roles.USER } } as unknown as Request;
    const res = makeRes();
    const next = jest.fn() as NextFunction;

    const middleware = isOwnerOrAdmin(async () => { throw new Error('DB error'); });
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
