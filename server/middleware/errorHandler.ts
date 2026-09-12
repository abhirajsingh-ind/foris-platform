import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[SECURITY ERROR] ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.statusCode || (err.status && typeof err.status === 'number' ? err.status : 500);

  res.status(statusCode).json({
    success: false,
    error: err.userMessage || err.message || 'An internal system error occurred. Please contact the forensic administrator.',
    code: err.code || 'INTERNAL_ERROR',
    ...(isDev && err.stack ? { details: err.message } : {}),
  });
}
