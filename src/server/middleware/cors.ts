import { Request, Response, NextFunction } from 'express';

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3030')
  .split(',')
  .map(o => o.trim());

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  // Credentialed CORS requires echoing a specific allowlisted origin, never '*'.
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-CSRF-Token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  return next();
}
