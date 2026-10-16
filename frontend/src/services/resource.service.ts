import type {
  ApiResource,
  CreateResourceDto,
  UpdateResourceDto,
  ResourceQuery,
  PaginatedResponse,
  SystemMetricsResponse,
} from '../types/resource';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DEFAULT_TIMEOUT_MS = 8000;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${DEFAULT_TIMEOUT_MS / 1000}s`);
    }
    const msg = error instanceof Error ? error.message : 'Network failure';
    throw new Error(`Failed connecting to ${url}: ${msg}`);
  } finally {
    clearTimeout(timeoutId);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorObj = data as { error?: string; details?: string[] } | null;
    const errorMsg =
      errorObj?.details?.join(', ') ||
      errorObj?.error ||
      `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export async function fetchResources(query: ResourceQuery = {}, signal?: AbortSignal): Promise<PaginatedResponse<ApiResource>> {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.status && query.status !== 'all') params.set('status', query.status);
  if (query.environment && query.environment !== 'all') params.set('environment', query.environment);
  if (query.tag) params.set('tag', query.tag);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));

  const qs = params.toString();
  return request<PaginatedResponse<ApiResource>>(`/api/resources${qs ? `?${qs}` : ''}`, { signal });
}

export async function fetchResource(id: string, signal?: AbortSignal): Promise<ApiResource> {
  return request<ApiResource>(`/api/resources/${id}`, { signal });
}

export async function createResource(dto: CreateResourceDto): Promise<ApiResource> {
  return request<ApiResource>('/api/resources', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function updateResource(id: string, dto: UpdateResourceDto): Promise<ApiResource> {
  return request<ApiResource>(`/api/resources/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export async function deleteResource(id: string): Promise<void> {
  await request<{ message: string; id: string }>(`/api/resources/${id}`, {
    method: 'DELETE',
  });
}

export async function pingResource(id: string): Promise<ApiResource> {
  return request<ApiResource>(`/api/resources/${id}/ping`, {
    method: 'POST',
  });
}

export async function fetchMetrics(signal?: AbortSignal): Promise<SystemMetricsResponse> {
  return request<SystemMetricsResponse>('/api/metrics', { signal });
}
