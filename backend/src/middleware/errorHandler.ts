import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorResponse } from '../types/api.js';

/**
 * Centralized error handling middleware.
 * Ensures all unexpected server errors return a consistent JSON payload.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction
): void {
  console.error('[ServerError]', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
}
