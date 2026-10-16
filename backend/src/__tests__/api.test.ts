import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { resourceService } from '../services/resource.service.js';

describe('Backend API Suite', () => {
  beforeEach(() => {
    resourceService.resetToDefaults();
  });

  describe('Security Headers', () => {
    it('should include production security headers on responses', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['content-security-policy']).toBeDefined();
    });
  });

  describe('GET /api/health', () => {
    it('should return 200 with status ok and valid ISO timestamp', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
    });
  });

  describe('GET /api/message', () => {
    it('should return 200 with a sample message', async () => {
      const res = await request(app).get('/api/message');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(typeof res.body.message).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/greeting', () => {
    it('should return 200 with personalized greeting when name is valid', async () => {
      const res = await request(app)
        .post('/api/greeting')
        .send({ name: 'Grace Hopper' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        'greeting',
        'Hello, Grace Hopper! Welcome to the full-stack application.'
      );
    });

    it('should return 400 Bad Request when name is empty', async () => {
      const res = await request(app).post('/api/greeting').send({ name: '   ' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Name is required and must not be empty.');
    });

    it('should return 400 Bad Request when name field is omitted', async () => {
      const res = await request(app).post('/api/greeting').send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 400 Bad Request when name exceeds maximum length (100 chars)', async () => {
      const longName = 'A'.repeat(101);
      const res = await request(app).post('/api/greeting').send({ name: longName });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('100 characters');
    });
  });

  describe('GET /api/metrics (Telemetry)', () => {
    it('should return live system telemetry metrics', async () => {
      const res = await request(app).get('/api/metrics');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('uptimeSeconds');
      expect(res.body).toHaveProperty('totalResources');
      expect(res.body).toHaveProperty('healthyResources');
      expect(res.body).toHaveProperty('avgLatencyMs');
      expect(res.body.totalResources).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Resource Manager CRUD (/api/resources)', () => {
    it('should list paginated resources with metadata', async () => {
      const res = await request(app).get('/api/resources?page=1&limit=4');
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(4);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(4);
      expect(res.body.total).toBe(6);
      expect(res.body.totalPages).toBe(2);
    });

    it('should filter resources by search term', async () => {
      const res = await request(app).get('/api/resources?search=Stripe');
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.items[0].name).toContain('Stripe');
    });

    it('should filter resources by environment', async () => {
      const res = await request(app).get('/api/resources?environment=staging');
      expect(res.status).toBe(200);
      expect(res.body.items.every((r: any) => r.environment === 'staging')).toBe(true);
    });

    it('should filter resources by status', async () => {
      const res = await request(app).get('/api/resources?status=offline');
      expect(res.status).toBe(200);
      expect(res.body.items.every((r: any) => r.status === 'offline')).toBe(true);
    });

    it('should create a valid resource with 201 Created', async () => {
      const newService = {
        name: 'Redis Cache Proxy',
        endpoint: '/api/v1/cache',
        method: 'GET',
        environment: 'production',
        status: 'healthy',
        tags: ['cache', 'in-memory', 'fast'],
        description: 'Redis proxy providing sub-millisecond session caching.',
      };

      const res = await request(app).post('/api/resources').send(newService);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Redis Cache Proxy');
      expect(res.body.tags).toEqual(['cache', 'in-memory', 'fast']);
    });

    it('should reject invalid resource creation with 400 Bad Request', async () => {
      const invalidService = {
        name: 'A', // too short (< 2)
        endpoint: 'bad-endpoint', // must start with / or http
        method: 'INVALID_METHOD',
        environment: 'unknown_env',
        tags: 'not-an-array',
      };

      const res = await request(app).post('/api/resources').send(invalidService);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Validation failed');
      expect(res.body.details.length).toBeGreaterThanOrEqual(4);
    });

    it('should update an existing resource with 200 OK', async () => {
      const listRes = await request(app).get('/api/resources?limit=1');
      const targetId = listRes.body.items[0].id;

      const updateRes = await request(app)
        .put(`/api/resources/${targetId}`)
        .send({ status: 'degraded', description: 'Updated during maintenance' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.status).toBe('degraded');
      expect(updateRes.body.description).toBe('Updated during maintenance');
    });

    it('should return 404 when updating non-existent resource', async () => {
      const res = await request(app)
        .put('/api/resources/non-existent-id')
        .send({ name: 'Valid Name' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Resource not found');
    });

    it('should ping a resource and return updated latency', async () => {
      const listRes = await request(app).get('/api/resources?limit=1');
      const targetId = listRes.body.items[0].id;

      const pingRes = await request(app).post(`/api/resources/${targetId}/ping`);
      expect(pingRes.status).toBe(200);
      expect(pingRes.body).toHaveProperty('latencyMs');
      expect(typeof pingRes.body.latencyMs).toBe('number');
    });

    it('should delete a resource with 200 OK', async () => {
      const listRes = await request(app).get('/api/resources?limit=1');
      const targetId = listRes.body.items[0].id;

      const delRes = await request(app).delete(`/api/resources/${targetId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body).toHaveProperty('message', 'Resource successfully deleted');

      const getRes = await request(app).get(`/api/resources/${targetId}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('Routing & 404 Fallback', () => {
    it('should return structured JSON 404 for undefined routes', async () => {
      const res = await request(app).get('/api/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Route not found' });
    });
  });
});
