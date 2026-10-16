import { randomUUID } from 'node:crypto';
import type {
  ApiResource,
  CreateResourceDto,
  UpdateResourceDto,
  ResourceQuery,
  PaginatedResponse,
  SystemMetricsResponse,
} from '../types/resource.js';

const SEED_RESOURCES: Omit<ApiResource, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'User Identity & Auth API',
    endpoint: '/api/v1/auth',
    method: 'POST',
    environment: 'production',
    status: 'healthy',
    latencyMs: 38,
    uptimePercent: 99.98,
    tags: ['core', 'security', 'auth'],
    description: 'OAuth2 / OpenID Connect token issuance, verification, and revocation service.',
  },
  {
    name: 'Stripe Billing & Subscriptions Webhook',
    endpoint: '/api/v1/billing/webhook',
    method: 'POST',
    environment: 'production',
    status: 'healthy',
    latencyMs: 95,
    uptimePercent: 99.95,
    tags: ['billing', 'payments', 'finance'],
    description: 'Ingests charge succeeded, invoice finalized, and customer subscription lifecycle events.',
  },
  {
    name: 'Transactional Email & SMS Worker',
    endpoint: '/api/v1/notifications/dispatch',
    method: 'POST',
    environment: 'staging',
    status: 'degraded',
    latencyMs: 310,
    uptimePercent: 98.40,
    tags: ['messaging', 'async', 'notifications'],
    description: 'High-throughput outbound notification queue processing with multi-provider fallbacks.',
  },
  {
    name: 'Product Catalog & Vector Search',
    endpoint: '/api/v1/catalog/search',
    method: 'GET',
    environment: 'production',
    status: 'healthy',
    latencyMs: 44,
    uptimePercent: 99.99,
    tags: ['search', 'catalog', 'ai'],
    description: 'Sub-50ms hybrid lexical and semantic search across 2M inventory items.',
  },
  {
    name: 'Real-Time Telemetry & Event Ingestion',
    endpoint: '/api/v1/telemetry/collect',
    method: 'POST',
    environment: 'production',
    status: 'healthy',
    latencyMs: 22,
    uptimePercent: 99.99,
    tags: ['analytics', 'metrics', 'streaming'],
    description: 'Low-latency collector for user interaction telemetry and performance vitals.',
  },
  {
    name: 'Legacy CRM Synchronization Gateway',
    endpoint: '/api/v1/integrations/crm/sync',
    method: 'PUT',
    environment: 'development',
    status: 'offline',
    latencyMs: 1250,
    uptimePercent: 94.20,
    tags: ['legacy', 'sync', 'crm'],
    description: 'Nightly batch sync pipe connecting modern customer records with on-prem ERP.',
  },
];

class ResourceService {
  private resources: Map<string, ApiResource> = new Map();
  private readonly processStartTime = Date.now();

  constructor() {
    this.seed();
  }

  private seed(): void {
    const now = new Date();
    SEED_RESOURCES.forEach((item, index) => {
      const id = randomUUID();
      const createdDate = new Date(now.getTime() - (index + 1) * 3600 * 1000 * 24);
      this.resources.set(id, {
        ...item,
        id,
        createdAt: createdDate.toISOString(),
        updatedAt: now.toISOString(),
      });
    });
  }

  public resetToDefaults(): void {
    this.resources.clear();
    this.seed();
  }

  public list(query: ResourceQuery = {}): PaginatedResponse<ApiResource> {
    const {
      search = '',
      status = 'all',
      environment = 'all',
      tag = '',
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 6,
    } = query;

    let items = Array.from(this.resources.values());

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.endpoint.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'all') {
      items = items.filter((r) => r.status === status);
    }

    if (environment && environment !== 'all') {
      items = items.filter((r) => r.environment === environment);
    }

    if (tag.trim()) {
      const targetTag = tag.trim().toLowerCase();
      items = items.filter((r) => r.tags.some((t) => t.toLowerCase() === targetTag));
    }

    items.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'latencyMs':
          comparison = a.latencyMs - b.latencyMs;
          break;
        case 'uptimePercent':
          comparison = a.uptimePercent - b.uptimePercent;
          break;
        case 'updatedAt':
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = items.length;
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const totalPages = Math.ceil(total / safeLimit) || 1;
    const offset = (safePage - 1) * safeLimit;
    const paginatedItems = items.slice(offset, offset + safeLimit);

    return {
      items: paginatedItems,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
    };
  }

  public getById(id: string): ApiResource | null {
    return this.resources.get(id) || null;
  }

  public create(dto: CreateResourceDto): ApiResource {
    const id = randomUUID();
    const now = new Date().toISOString();
    const resource: ApiResource = {
      id,
      name: dto.name.trim(),
      endpoint: dto.endpoint.trim(),
      method: dto.method,
      environment: dto.environment,
      status: dto.status ?? 'healthy',
      latencyMs: Math.floor(Math.random() * 60) + 15,
      uptimePercent: 99.99,
      tags: dto.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
      description: dto.description.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.resources.set(id, resource);
    return resource;
  }

  public update(id: string, dto: UpdateResourceDto): ApiResource | null {
    const existing = this.resources.get(id);
    if (!existing) return null;

    const updated: ApiResource = {
      ...existing,
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.endpoint !== undefined && { endpoint: dto.endpoint.trim() }),
      ...(dto.method !== undefined && { method: dto.method }),
      ...(dto.environment !== undefined && { environment: dto.environment }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.description !== undefined && { description: dto.description.trim() }),
      ...(dto.tags !== undefined && {
        tags: dto.tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
      }),
      updatedAt: new Date().toISOString(),
    };

    this.resources.set(id, updated);
    return updated;
  }

  public delete(id: string): boolean {
    return this.resources.delete(id);
  }

  public async ping(id: string): Promise<ApiResource | null> {
    const resource = this.resources.get(id);
    if (!resource) return null;

    const jitter = Math.floor(Math.random() * 25) - 10;
    const newLatency = Math.max(5, resource.latencyMs + jitter);

    let newStatus = resource.status;
    if (newLatency > 400 && resource.status === 'healthy') {
      newStatus = 'degraded';
    } else if (newLatency < 200 && resource.status === 'degraded') {
      newStatus = 'healthy';
    }

    const updated: ApiResource = {
      ...resource,
      latencyMs: newLatency,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    this.resources.set(id, updated);
    return updated;
  }

  public getMetrics(): SystemMetricsResponse {
    const items = Array.from(this.resources.values());
    const total = items.length;
    const healthy = items.filter((r) => r.status === 'healthy').length;
    const degraded = items.filter((r) => r.status === 'degraded').length;
    const offline = items.filter((r) => r.status === 'offline').length;

    const totalLatency = items.reduce((acc, r) => acc + r.latencyMs, 0);
    const avgLatency = total > 0 ? Math.round(totalLatency / total) : 0;
    const overallHealthPercent = total > 0 ? Math.round((healthy / total) * 100) : 100;

    const memoryUsage = process.memoryUsage();
    const memoryUsageMb = Math.round((memoryUsage.heapUsed / 1024 / 1024) * 10) / 10;
    const uptimeSeconds = Math.floor((Date.now() - this.processStartTime) / 1000);

    return {
      uptimeSeconds,
      memoryUsageMb,
      totalResources: total,
      healthyResources: healthy,
      degradedResources: degraded,
      offlineResources: offline,
      avgLatencyMs: avgLatency,
      overallHealthPercent,
      timestamp: new Date().toISOString(),
    };
  }
}

export const resourceService = new ResourceService();
