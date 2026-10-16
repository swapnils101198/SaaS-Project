export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type Environment = 'production' | 'staging' | 'development';
export type ServiceStatus = 'healthy' | 'degraded' | 'offline';

export interface ApiResource {
  id: string;
  name: string;
  endpoint: string;
  method: HttpMethod;
  environment: Environment;
  status: ServiceStatus;
  latencyMs: number;
  uptimePercent: number;
  tags: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceDto {
  name: string;
  endpoint: string;
  method: HttpMethod;
  environment: Environment;
  status?: ServiceStatus;
  tags: string[];
  description: string;
}

export interface UpdateResourceDto {
  name?: string;
  endpoint?: string;
  method?: HttpMethod;
  environment?: Environment;
  status?: ServiceStatus;
  tags?: string[];
  description?: string;
}

export interface ResourceQuery {
  search?: string;
  status?: ServiceStatus | 'all';
  environment?: Environment | 'all';
  tag?: string;
  sortBy?: 'name' | 'latencyMs' | 'uptimePercent' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SystemMetricsResponse {
  uptimeSeconds: number;
  memoryUsageMb: number;
  totalResources: number;
  healthyResources: number;
  degradedResources: number;
  offlineResources: number;
  avgLatencyMs: number;
  overallHealthPercent: number;
  timestamp: string;
}
