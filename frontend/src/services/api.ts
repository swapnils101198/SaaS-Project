import type {
  HealthResponse,
  MessageResponse,
  GreetingRequest,
  GreetingResponse,
  ApiErrorResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DEFAULT_TIMEOUT_MS = 8000;

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Generic fetch wrapper with structured error handling, configurable timeout, and abort support.
 */
async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Link caller signal if provided
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
      throw new Error(`Request timed out after ${timeoutMs / 1000}s while contacting ${API_BASE_URL}`);
    }
    const errMessage = error instanceof Error ? error.message : 'Network request failed';
    throw new Error(`Unable to connect to backend at ${API_BASE_URL}: ${errMessage}`);
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
    const errorPayload = data as ApiErrorResponse | null;
    const message = errorPayload?.error || `Request failed with status ${response.status} (${response.statusText})`;
    throw new Error(message);
  }

  return data as T;
}

/**
 * Fetches the backend health status.
 */
export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiFetch<HealthResponse>('/api/health', { signal });
}

/**
 * Fetches the sample message from the backend.
 */
export async function fetchMessage(signal?: AbortSignal): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/api/message', { signal });
}

/**
 * Sends a greeting request to the backend.
 */
export async function sendGreeting(name: string, signal?: AbortSignal): Promise<GreetingResponse> {
  const payload: GreetingRequest = { name };
  return apiFetch<GreetingResponse>('/api/greeting', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal,
  });
}
