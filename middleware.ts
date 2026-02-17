import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";
import { captureError } from "@/lib/observability";

type SecurityContext = {
  requestId: string;
  correlationId: string;
  cspNonce: string;
  includeUpgradeInsecureRequests: boolean;
  allowUnsafeEvalInScripts: boolean;
};

function createSecurityContext(request: NextRequest): SecurityContext {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const correlationId = request.headers.get("x-correlation-id") || requestId;
  const cspNonce = crypto.randomUUID().replace(/-/g, "");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isHttpsRequest = request.nextUrl.protocol === "https:" || forwardedProto === "https";
  const isLocalHost =
    request.nextUrl.hostname === "localhost" ||
    request.nextUrl.hostname === "127.0.0.1" ||
    request.nextUrl.hostname === "::1";
  const allowUnsafeEvalInScripts = process.env.NODE_ENV !== "production";

  return {
    requestId,
    correlationId,
    cspNonce,
    includeUpgradeInsecureRequests: isHttpsRequest && !isLocalHost,
    allowUnsafeEvalInScripts,
  };
}

function buildContentSecurityPolicy(
  cspNonce: string,
  includeUpgradeInsecureRequests: boolean,
  allowUnsafeEvalInScripts: boolean
): string {
  const scriptSrcDirective = [
    "'self'",
    `'nonce-${cspNonce}'`,
    "https://js.stripe.com",
  ];

  if (allowUnsafeEvalInScripts) {
    // Required for Next.js dev/test bundles (including Playwright WebKit runs).
    scriptSrcDirective.push("'unsafe-eval'");
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrcDirective.join(" ")}`,
    // App Router injects inline bootstrap scripts; allow inline script elements explicitly.
    "script-src-elem 'self' 'unsafe-inline' https://js.stripe.com",
    "script-src-attr 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://js.stripe.com https://fonts.googleapis.com",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "report-uri /api/security/csp-report",
  ];

  if (includeUpgradeInsecureRequests) {
    directives.splice(directives.length - 1, 0, "upgrade-insecure-requests");
  }

  return directives.join("; ");
}

function applySecurityHeaders(response: NextResponse, security: SecurityContext): NextResponse {
  response.headers.set("x-request-id", security.requestId);
  response.headers.set("x-correlation-id", security.correlationId);
  response.headers.set("x-nonce", security.cspNonce);
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("strict-transport-security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  response.headers.set("cross-origin-opener-policy", "same-origin");
  response.headers.set("cross-origin-resource-policy", "same-origin");
  response.headers.set("origin-agent-cluster", "?1");
  response.headers.set("x-permitted-cross-domain-policies", "none");
  response.headers.set(
    "content-security-policy",
    buildContentSecurityPolicy(
      security.cspNonce,
      security.includeUpgradeInsecureRequests,
      security.allowUnsafeEvalInScripts
    )
  );
  return response;
}

// ============================================================================
// RATE LIMITING (middleware-level, distributed token bucket)
// ============================================================================

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function checkMiddlewareRateLimit(
  supabase: ReturnType<typeof createServerClient>,
  request: NextRequest,
  prefix: string,
  maxTokens: number,
  refillRate: number
): Promise<{ allowed: boolean; retryAfter?: number; error?: string }> {
  const ip = getClientIp(request);

  const { data, error } = await supabase
    .rpc("check_rate_limit", {
      p_key: `${prefix}:${ip}`,
      p_max_tokens: maxTokens,
      p_refill_rate: refillRate,
    })
    .single();

  if (error) {
    return { allowed: false, error: error.message };
  }

  const result = data as { allowed?: boolean; retry_after?: number | null } | null;
  if (!result?.allowed) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Number(result?.retry_after ?? 1)),
    };
  }

  return { allowed: true };
}

// ============================================================================
// CSRF ORIGIN VALIDATION
// ============================================================================

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Non-browser clients (curl, Postman) won't send Origin — allow if no origin
  if (!origin) return true;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

// ============================================================================
// PUBLIC API ROUTES (no auth required)
// ============================================================================

const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/webhooks",
  "/api/health",
  "/api/public",
  "/api/security/csp-report",
];

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest) {
  const security = createSecurityContext(request);
  const env = getServerEnv();
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", security.requestId);
  requestHeaders.set("x-correlation-id", security.correlationId);
  requestHeaders.set("x-nonce", security.cspNonce);
  requestHeaders.set("x-csp-nonce", security.cspNonce);

  let supabaseResponse = applySecurityHeaders(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
    security
  );

  // ========================================================================
  // STATIC ASSETS — pass through immediately
  // ========================================================================
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return applySecurityHeaders(supabaseResponse, security);
  }

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = applySecurityHeaders(
            NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            }),
            security
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ========================================================================
  // API ROUTES — CSRF + rate limiting (auth enforced per-route)
  // ========================================================================
  if (pathname.startsWith("/api")) {
    const method = request.method;

    // CSRF origin validation for mutation requests
    if (MUTATION_METHODS.has(method) && !isPublicApiRoute(pathname)) {
      if (!validateOrigin(request)) {
        return applySecurityHeaders(
          NextResponse.json(
            { error: { code: "CSRF_REJECTED", message: "Origin validation failed" } },
            { status: 403 }
          ),
          security
        );
      }
    }

    // Rate limiting: stricter for auth endpoints, standard for writes
    if (pathname.startsWith("/api/auth")) {
      const result = await checkMiddlewareRateLimit(supabase, request, "auth", 10, 0.167);
      if (result.error) {
        captureError(new Error(result.error), "middleware.rate_limit_check_failed", {
          path: pathname,
          method,
          bucket: "auth",
          request_id: security.requestId,
          correlation_id: security.correlationId,
        });
        return applySecurityHeaders(
          NextResponse.json(
            { error: { code: "RATE_LIMIT_CHECK_FAILED", message: "Rate limit service unavailable" } },
            { status: 503 }
          ),
          security
        );
      }
      if (!result.allowed) {
        return applySecurityHeaders(
          NextResponse.json(
            { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later.", details: { retry_after_seconds: result.retryAfter } } },
            { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
          ),
          security
        );
      }
    } else if (MUTATION_METHODS.has(method)) {
      const result = await checkMiddlewareRateLimit(supabase, request, "write", 60, 1);
      if (result.error) {
        captureError(new Error(result.error), "middleware.rate_limit_check_failed", {
          path: pathname,
          method,
          bucket: "write",
          request_id: security.requestId,
          correlation_id: security.correlationId,
        });
        return applySecurityHeaders(
          NextResponse.json(
            { error: { code: "RATE_LIMIT_CHECK_FAILED", message: "Rate limit service unavailable" } },
            { status: 503 }
          ),
          security
        );
      }
      if (!result.allowed) {
        return applySecurityHeaders(
          NextResponse.json(
            { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later.", details: { retry_after_seconds: result.retryAfter } } },
            { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
          ),
          security
        );
      }
    } else {
      const result = await checkMiddlewareRateLimit(supabase, request, "read", 120, 2);
      if (result.error) {
        captureError(new Error(result.error), "middleware.rate_limit_check_failed", {
          path: pathname,
          method,
          bucket: "read",
          request_id: security.requestId,
          correlation_id: security.correlationId,
        });
        return applySecurityHeaders(
          NextResponse.json(
            { error: { code: "RATE_LIMIT_CHECK_FAILED", message: "Rate limit service unavailable" } },
            { status: 503 }
          ),
          security
        );
      }
      if (!result.allowed) {
        return applySecurityHeaders(
          NextResponse.json(
            { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later.", details: { retry_after_seconds: result.retryAfter } } },
            { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
          ),
          security
        );
      }
    }

    // Return with refreshed session cookies — individual route guards handle auth
    return applySecurityHeaders(supabaseResponse, security);
  }

  // ========================================================================
  // PAGE ROUTES — authentication + onboarding enforcement
  // ========================================================================

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/verify-mfa",
    "/magic-link",
    "/invite",
    "/terms",
    "/privacy",
    "/auth/callback",
    "/client-portal",
    "/",
    "/p",
  ];

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Refresh/read Supabase auth only for page-route protection flow
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not authenticated - redirect to login (except for public routes)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return applySecurityHeaders(NextResponse.redirect(url), security);
  }

  // Authenticated user — single onboarding check for all page routes
  if (user) {
    const isAuthPage = pathname === "/login" || pathname === "/register";
    const isOnboardingPage = pathname.startsWith("/onboarding");
    const needsOnboardingCheck = isAuthPage || isOnboardingPage || (!isPublicRoute && pathname.startsWith("/"));

    if (needsOnboardingCheck) {
      const metadata = user.user_metadata as
        | { onboarding_completed?: boolean; onboarding_completed_at?: string | null }
        | null
        | undefined;

      const metadataOnboardingDone =
        metadata?.onboarding_completed === true || Boolean(metadata?.onboarding_completed_at);

      let onboardingDone = metadataOnboardingDone;

      if (!metadataOnboardingDone) {
        const { data: userData } = await supabase
          .from("users")
          .select("onboarding_completed_at")
          .eq("id", user.id)
          .single();

        onboardingDone = !!userData?.onboarding_completed_at;
      }

      const url = request.nextUrl.clone();

      if (isAuthPage) {
        url.pathname = onboardingDone ? "/dashboard" : "/onboarding/welcome";
        return applySecurityHeaders(NextResponse.redirect(url), security);
      }

      if (!onboardingDone && !isOnboardingPage && !isPublicRoute) {
        url.pathname = "/onboarding/welcome";
        return applySecurityHeaders(NextResponse.redirect(url), security);
      }

      if (onboardingDone && isOnboardingPage) {
        url.pathname = "/dashboard";
        return applySecurityHeaders(NextResponse.redirect(url), security);
      }
    }
  }

  return applySecurityHeaders(supabaseResponse, security);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
