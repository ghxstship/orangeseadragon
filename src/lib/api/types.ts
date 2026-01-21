/**
 * API Types
 * Core type definitions for API routes and responses
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  timestamp?: string;
  requestId?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  [key: string]: string | string[] | undefined;
}

export interface ListParams extends PaginationParams, SortParams {
  search?: string;
  filters?: FilterParams;
  include?: string[];
}

export interface BulkOperation<T = unknown> {
  operation: "create" | "update" | "delete";
  items: T[];
}

export interface BulkResult {
  success: number;
  failed: number;
  errors: Array<{ index: number; error: ApiError }>;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RouteConfig {
  path: string;
  method: HttpMethod;
  handler: string;
  middleware?: string[];
  rateLimit?: RateLimitConfig;
  permissions?: string[];
  validation?: ValidationConfig;
}

export interface RateLimitConfig {
  requests: number;
  window: number; // seconds
  keyBy?: "ip" | "user" | "organization";
}

export interface ValidationConfig {
  body?: string; // Zod schema name
  query?: string;
  params?: string;
}

export interface ApiRouteDefinition {
  service: string;
  basePath: string;
  routes: RouteConfig[];
  rateLimit?: RateLimitConfig;
}

// Domain-specific request/response types
export interface CreateEntityRequest<T> {
  data: Omit<T, "id" | "createdAt" | "updatedAt">;
}

export interface UpdateEntityRequest<T> {
  data: Partial<T>;
}

export interface EntityResponse<T> {
  entity: T;
}

export interface ListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Webhook types
export interface WebhookPayload<T = unknown> {
  event: string;
  timestamp: string;
  data: T;
  signature?: string;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
}
