import { NextResponse } from "next/server";

/**
 * ATLVS API Response Envelope — Single Source of Truth
 *
 * All API routes MUST use these helpers to ensure consistent response shapes.
 *
 * Success: { data, meta? }
 * Error:   { error: { code, message, details? } }
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiSuccessBody<T = unknown> {
  data: T;
  meta?: Record<string, unknown>;
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

export function unauthorized(message = "Authentication required"): NextResponse<ApiErrorBody> {
  return apiError("UNAUTHORIZED", message, 401);
}

export function forbidden(message = "Insufficient permissions"): NextResponse<ApiErrorBody> {
  return apiError("FORBIDDEN", message, 403);
}

export function notFound(entity = "Resource"): NextResponse<ApiErrorBody> {
  return apiError("NOT_FOUND", `${entity} not found`, 404);
}

export function badRequest(message: string, details?: Record<string, unknown>): NextResponse<ApiErrorBody> {
  return apiError("BAD_REQUEST", message, 400, details);
}

export function conflict(message: string): NextResponse<ApiErrorBody> {
  return apiError("CONFLICT", message, 409);
}

export function unprocessable(message: string, details?: Record<string, unknown>): NextResponse<ApiErrorBody> {
  return apiError("UNPROCESSABLE_ENTITY", message, 422, details);
}

export function serverError(message = "Internal server error"): NextResponse<ApiErrorBody> {
  return apiError("INTERNAL_ERROR", message, 500);
}

export function supabaseError(error: { message: string; code?: string }): NextResponse<ApiErrorBody> {
  return apiError(
    error.code || "DATABASE_ERROR",
    error.message,
    500,
    { supabase_code: error.code }
  );
}

// ============================================================================
// SUCCESS RESPONSES
// ============================================================================

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({
    data,
    ...(meta ? { meta } : {}),
  });
}

export function apiCreated<T>(data: T, meta?: Record<string, unknown>): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({
    data,
    ...(meta ? { meta } : {}),
  }, { status: 201 });
}

export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// ============================================================================
// PAGINATION HELPER
// ============================================================================

export function apiPaginated<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): NextResponse<ApiSuccessBody<T[]>> {
  return NextResponse.json({
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasMore: pagination.page * pagination.limit < pagination.total,
    },
  });
}
