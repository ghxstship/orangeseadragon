import { NextRequest } from 'next/server';
import { apiError } from '@/lib/api/response';
import { createUntypedClient } from '@/lib/supabase/server';

/**
 * ATLVS Rate Limiting — Distributed Token Bucket
 *
 * Enforces per-IP rate limits on write endpoints.
 * Backed by PostgreSQL via Supabase RPC (check_rate_limit).
 */

export interface RateLimitConfig {
  /** Maximum tokens in the bucket */
  maxTokens: number;
  /** Tokens refilled per second */
  refillRate: number;
  /** Key prefix for namespacing */
  prefix?: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 60,
  refillRate: 1,
  prefix: 'api',
};

/**
 * Check rate limit for a request.
 * Returns null if allowed, or a 429 Response if rate limited.
 */
export async function checkRateLimit(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
) {
  const { maxTokens, refillRate, prefix } = { ...DEFAULT_CONFIG, ...config };

  // Extract client identifier
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const key = `${prefix}:${ip}`;

  const supabase = await createUntypedClient();
  const { data, error } = await supabase
    .rpc('check_rate_limit', {
      p_key: key,
      p_max_tokens: maxTokens,
      p_refill_rate: refillRate,
    })
    .single();

  if (error) {
    return apiError(
      'RATE_LIMIT_CHECK_FAILED',
      'Rate limit service unavailable',
      503
    );
  }

  const result = data as { allowed?: boolean; retry_after?: number | null } | null;

  if (!result?.allowed) {
    const retryAfter = Math.max(1, Number(result?.retry_after ?? 1));
    return apiError(
      'RATE_LIMITED',
      'Too many requests. Please try again later.',
      429,
      { retry_after_seconds: retryAfter }
    );
  }

  return null;
}

/**
 * Rate limit presets for different endpoint types
 */
export const RATE_LIMITS = {
  /** Standard write endpoints: 60 req/min */
  write: { maxTokens: 60, refillRate: 1, prefix: 'write' },
  /** Auth endpoints: 10 req/min */
  auth: { maxTokens: 10, refillRate: 0.167, prefix: 'auth' },
  /** Export/heavy endpoints: 10 req/min */
  export: { maxTokens: 10, refillRate: 0.167, prefix: 'export' },
  /** Webhook endpoints: 120 req/min */
  webhook: { maxTokens: 120, refillRate: 2, prefix: 'webhook' },
} as const;
