import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ============================================================================
// RATE LIMITING (middleware-level, in-memory token bucket)
// ============================================================================

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
let lastRateLimitCleanup = Date.now();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkMiddlewareRateLimit(
  ip: string,
  prefix: string,
  maxTokens: number,
  refillRate: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  // Cleanup stale entries every 5 minutes
  if (now - lastRateLimitCleanup > 300_000) {
    lastRateLimitCleanup = now;
    const stale = now - 60_000;
    Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
      if (entry.lastRefill < stale) rateLimitStore.delete(key);
    });
  }

  const key = `${prefix}:${ip}`;
  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = { tokens: maxTokens, lastRefill: now };
    rateLimitStore.set(key, entry);
  }

  const elapsed = (now - entry.lastRefill) / 1000;
  entry.tokens = Math.min(maxTokens, entry.tokens + elapsed * refillRate);
  entry.lastRefill = now;

  if (entry.tokens < 1) {
    return { allowed: false, retryAfter: Math.ceil((1 - entry.tokens) / refillRate) };
  }

  entry.tokens -= 1;
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
];

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always refresh the Supabase session (keeps cookies alive for API + page routes)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ========================================================================
  // STATIC ASSETS — pass through immediately
  // ========================================================================
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return supabaseResponse;
  }

  // ========================================================================
  // API ROUTES — CSRF + rate limiting + session refresh (auth enforced per-route)
  // ========================================================================
  if (pathname.startsWith("/api")) {
    const method = request.method;

    // CSRF origin validation for mutation requests
    if (MUTATION_METHODS.has(method) && !isPublicApiRoute(pathname)) {
      if (!validateOrigin(request)) {
        return NextResponse.json(
          { error: { code: "CSRF_REJECTED", message: "Origin validation failed" } },
          { status: 403 }
        );
      }
    }

    // Rate limiting: stricter for auth endpoints, standard for writes
    const ip = getClientIp(request);

    if (pathname.startsWith("/api/auth")) {
      const result = checkMiddlewareRateLimit(ip, "auth", 10, 0.167);
      if (!result.allowed) {
        return NextResponse.json(
          { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later.", details: { retry_after_seconds: result.retryAfter } } },
          { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
        );
      }
    } else if (MUTATION_METHODS.has(method)) {
      const result = checkMiddlewareRateLimit(ip, "write", 60, 1);
      if (!result.allowed) {
        return NextResponse.json(
          { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later.", details: { retry_after_seconds: result.retryAfter } } },
          { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
        );
      }
    } else {
      const result = checkMiddlewareRateLimit(ip, "read", 120, 2);
      if (!result.allowed) {
        return NextResponse.json(
          { error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later.", details: { retry_after_seconds: result.retryAfter } } },
          { status: 429, headers: { "Retry-After": String(result.retryAfter) } }
        );
      }
    }

    // Return with refreshed session cookies — individual route guards handle auth
    return supabaseResponse;
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
    "/",
    "/p",
  ];

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Not authenticated - redirect to login (except for public routes)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user — single onboarding check for all page routes
  if (user) {
    const isAuthPage = pathname === "/login" || pathname === "/register";
    const isOnboardingPage = pathname.startsWith("/onboarding");
    const needsOnboardingCheck = isAuthPage || isOnboardingPage || (!isPublicRoute && pathname.startsWith("/"));

    if (needsOnboardingCheck) {
      const { data: userData } = await supabase
        .from("users")
        .select("onboarding_completed_at")
        .eq("id", user.id)
        .single();

      const onboardingDone = !!userData?.onboarding_completed_at;
      const url = request.nextUrl.clone();

      if (isAuthPage) {
        url.pathname = onboardingDone ? "/dashboard" : "/onboarding/welcome";
        return NextResponse.redirect(url);
      }

      if (!onboardingDone && !isOnboardingPage && !isPublicRoute) {
        url.pathname = "/onboarding/welcome";
        return NextResponse.redirect(url);
      }

      if (onboardingDone && isOnboardingPage) {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
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
