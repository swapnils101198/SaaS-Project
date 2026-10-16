import type { Request, Response, NextFunction } from 'express';
import type { HttpMethod, Environment, ServiceStatus } from '../types/resource.js';

const VALID_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const VALID_ENVIRONMENTS: Environment[] = ['production', 'staging', 'development'];
const VALID_STATUSES: ServiceStatus[] = ['healthy', 'degraded', 'offline'];

export function validateCreateResource(req: Request, res: Response, next: NextFunction): void {
  const { name, endpoint, method, environment, status, tags, description } = req.body ?? {};

  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
    errors.push('Name is required and must be between 2 and 60 characters.');
  }

  if (
    !endpoint ||
    typeof endpoint !== 'string' ||
    endpoint.trim().length > 120 ||
    (!endpoint.trim().startsWith('/') && !/^https?:\/\//i.test(endpoint.trim()))
  ) {
    errors.push('Endpoint must be a valid path (e.g. /api/v1/auth) or absolute URL (max 120 chars).');
  }

  if (!method || !VALID_METHODS.includes(method as HttpMethod)) {
    errors.push(`Method must be one of: ${VALID_METHODS.join(', ')}.`);
  }

  if (!environment || !VALID_ENVIRONMENTS.includes(environment as Environment)) {
    errors.push(`Environment must be one of: ${VALID_ENVIRONMENTS.join(', ')}.`);
  }

  if (status !== undefined && !VALID_STATUSES.includes(status as ServiceStatus)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  if (description !== undefined && (typeof description !== 'string' || description.length > 250)) {
    errors.push('Description cannot exceed 250 characters.');
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.push('Tags must be an array of strings.');
    } else if (tags.length > 10) {
      errors.push('Maximum 10 tags allowed.');
    } else if (tags.some((t) => typeof t !== 'string' || t.trim().length > 25)) {
      errors.push('Each tag must be a string up to 25 characters.');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  next();
}

export function validateUpdateResource(req: Request, res: Response, next: NextFunction): void {
  const { name, endpoint, method, environment, status, tags, description } = req.body ?? {};
  const errors: string[] = [];

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
      errors.push('Name must be between 2 and 60 characters.');
    }
  }

  if (endpoint !== undefined) {
    if (
      typeof endpoint !== 'string' ||
      endpoint.trim().length > 120 ||
      (!endpoint.trim().startsWith('/') && !/^https?:\/\//i.test(endpoint.trim()))
    ) {
      errors.push('Endpoint must be a valid path (e.g. /api/v1/auth) or absolute URL (max 120 chars).');
    }
  }

  if (method !== undefined && !VALID_METHODS.includes(method as HttpMethod)) {
    errors.push(`Method must be one of: ${VALID_METHODS.join(', ')}.`);
  }

  if (environment !== undefined && !VALID_ENVIRONMENTS.includes(environment as Environment)) {
    errors.push(`Environment must be one of: ${VALID_ENVIRONMENTS.join(', ')}.`);
  }

  if (status !== undefined && !VALID_STATUSES.includes(status as ServiceStatus)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  if (description !== undefined && (typeof description !== 'string' || description.length > 250)) {
    errors.push('Description cannot exceed 250 characters.');
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.push('Tags must be an array of strings.');
    } else if (tags.length > 10) {
      errors.push('Maximum 10 tags allowed.');
    } else if (tags.some((t) => typeof t !== 'string' || t.trim().length > 25)) {
      errors.push('Each tag must be a string up to 25 characters.');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  next();
}
