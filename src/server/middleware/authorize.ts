import { Request, Response, NextFunction } from 'express';
import { Roles } from 'common/constants';

/**
 * Returns an Express middleware that 403s unless the authenticated user either
 * owns the target resource or is an admin. `getOwnerUserID` resolves the resource's
 * owning userID - may be async (e.g. a DB lookup) and may return undefined if the
 * resource doesn't exist (in which case the route's own not-found handling should run,
 * so this passes through to next() and lets the route's existing !resource check fire).
 */
export function isOwnerOrAdmin(
  getOwnerUserID: (req: Request) => Promise<number | undefined> | number | undefined
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      if (req.user.roleID === Roles.ADMIN) {
        return next();
      }
      const ownerUserID = await getOwnerUserID(req);
      if (ownerUserID === undefined) {
        // Resource not found - let the route's own read/next() logic report 404.
        return next();
      }
      if (req.user.userID === ownerUserID) {
        return next();
      }
      const err: any = new Error('Not Authorized');
      err.status = 403;
      return next(err);
    } catch (err) {
      next(err);
    }
  };
}
