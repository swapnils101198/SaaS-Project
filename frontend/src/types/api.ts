/**
 * Shared API contracts and data models for frontend consumption
 */

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
}

export interface MessageResponse {
  message: string;
}

export interface GreetingRequest {
  name: string;
}

export interface GreetingResponse {
  greeting: string;
}

export interface ApiErrorResponse {
  error: string;
}
