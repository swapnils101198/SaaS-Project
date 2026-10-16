import { Router } from 'express';
import {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  pingResource,
  getMetrics,
} from '../controllers/resource.controller.js';
import {
  validateCreateResource,
  validateUpdateResource,
} from '../middleware/validation.js';

export const resourceRouter = Router();

// Metrics endpoint
resourceRouter.get('/telemetry/metrics', getMetrics);

// CRUD routes
resourceRouter.get('/', listResources);
resourceRouter.get('/:id', getResource);
resourceRouter.post('/', validateCreateResource, createResource);
resourceRouter.put('/:id', validateUpdateResource, updateResource);
resourceRouter.delete('/:id', deleteResource);
resourceRouter.post('/:id/ping', pingResource);
