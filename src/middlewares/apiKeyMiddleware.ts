import { Request, Response, NextFunction } from 'express';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'];

  if (!key || key !== process.env.INTERNAL_API_KEY) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  next();
}
