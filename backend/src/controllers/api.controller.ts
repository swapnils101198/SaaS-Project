import type { Request, Response } from 'express';
import type {
  HealthResponse,
  MessageResponse,
  GreetingRequest,
  GreetingResponse,
  ApiErrorResponse,
} from '../types/api.js';

/**
 * Controller handling health check.
 * Returns uptime, timestamp, and status.
 */
export function getHealth(
  _req: Request,
  res: Response<HealthResponse>
): void {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Controller handling sample message endpoint.
 */
export function getMessage(
  _req: Request,
  res: Response<MessageResponse>
): void {
  res.status(200).json({
    message: 'Hello from the Express TypeScript backend!',
  });
}

const MAX_NAME_LENGTH = 100;

/**
 * Controller handling personalized greeting generation with strict validation and sanitization.
 */
export function postGreeting(
  req: Request<Record<string, never>, GreetingResponse | ApiErrorResponse, GreetingRequest>,
  res: Response<GreetingResponse | ApiErrorResponse>
): void {
  const { name } = req.body ?? {};

  if (!name || typeof name !== 'string') {
    res.status(400).json({
      error: 'Name is required and must be a valid text string.',
    });
    return;
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    res.status(400).json({
      error: 'Name is required and must not be empty.',
    });
    return;
  }

  if (trimmedName.length > MAX_NAME_LENGTH) {
    res.status(400).json({
      error: `Name must not exceed ${MAX_NAME_LENGTH} characters.`,
    });
    return;
  }

  // Strip control characters to ensure safe output
  const sanitizedName = trimmedName.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  res.status(200).json({
    greeting: `Hello, ${sanitizedName}! Welcome to the full-stack application.`,
  });
}
