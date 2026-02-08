import { NextRequest } from 'next/server';
import { apiError } from '@/lib/api/response';

/**
 * ATLVS Rate Limiting — In-Memory Token Bucket
 *
 * Enforces per-IP rate limits on write endpoints.
 * Production deployments should replace with Redis-backed implementation.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const staleThreshold = now - 60 * 1000;
  Array.from(store.entries()).forEach(([key, entry]) => {
    if (entry.lastRefill < staleThreshold) {
      store.delete(key);
    }
  });
}

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
export function checkRateLimit(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
) {
  cleanup();

  const { maxTokens, refillRate, prefix } = { ...DEFAULT_CONFIG, ...config };

  // Extract client identifier
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const key = `${prefix}:${ip}`;
  const now = Date.now();

  let entry = store.get(key);

  if (!entry) {
    entry = { tokens: maxTokens, lastRefill: now };
    store.set(key, entry);
  }

  // Refill tokens based on elapsed time
  const elapsed = (now - entry.lastRefill) / 1000;
  entry.tokens = Math.min(maxTokens, entry.tokens + elapsed * refillRate);
  entry.lastRefill = now;

  if (entry.tokens < 1) {
    const retryAfter = Math.ceil((1 - entry.tokens) / refillRate);
    return apiError(
      'RATE_LIMITED',
      'Too many requests. Please try again later.',
      429,
      { retry_after_seconds: retryAfter }
    );
  }

  entry.tokens -= 1;
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
