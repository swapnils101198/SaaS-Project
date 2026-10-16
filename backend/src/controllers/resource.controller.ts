import type { Request, Response } from 'express';
import { resourceService } from '../services/resource.service.js';
import type {
  ResourceQuery,
  CreateResourceDto,
  UpdateResourceDto,
  HttpMethod,
  Environment,
  ServiceStatus,
} from '../types/resource.js';

export function listResources(req: Request, res: Response): void {
  const query: ResourceQuery = {
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
    status: typeof req.query.status === 'string' ? (req.query.status as ServiceStatus | 'all') : undefined,
    environment:
      typeof req.query.environment === 'string'
        ? (req.query.environment as Environment | 'all')
        : undefined,
    tag: typeof req.query.tag === 'string' ? req.query.tag : undefined,
    sortBy:
      typeof req.query.sortBy === 'string'
        ? (req.query.sortBy as 'name' | 'latencyMs' | 'uptimePercent' | 'updatedAt')
        : undefined,
    sortOrder: req.query.sortOrder === 'asc' ? 'asc' : 'desc',
    page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
    limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 6,
  };

  const result = resourceService.list(query);
  res.status(200).json(result);
}

export function getResource(req: Request<{ id: string }>, res: Response): void {
  const resource = resourceService.getById(req.params.id);
  if (!resource) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  res.status(200).json(resource);
}

export function createResource(
  req: Request<Record<string, never>, unknown, CreateResourceDto>,
  res: Response
): void {
  const resource = resourceService.create(req.body);
  res.status(201).json(resource);
}

export function updateResource(
  req: Request<{ id: string }, unknown, UpdateResourceDto>,
  res: Response
): void {
  const updated = resourceService.update(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  res.status(200).json(updated);
}

export function deleteResource(req: Request<{ id: string }>, res: Response): void {
  const deleted = resourceService.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  res.status(200).json({ message: 'Resource successfully deleted', id: req.params.id });
}

export async function pingResource(req: Request<{ id: string }>, res: Response): Promise<void> {
  const result = await resourceService.ping(req.params.id);
  if (!result) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  res.status(200).json(result);
}

export function getMetrics(_req: Request, res: Response): void {
  const metrics = resourceService.getMetrics();
  res.status(200).json(metrics);
}
