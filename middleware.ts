import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/invite",
    "/terms",
    "/privacy",
    "/",
  ];

  // Check if current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Static assets and API routes should pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Static files
  ) {
    return supabaseResponse;
  }

  // Not authenticated - redirect to login (except for public routes)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated user on auth pages - redirect to dashboard or onboarding
  if (user && (pathname === "/login" || pathname === "/register")) {
    // Check if user needs onboarding
    const { data: userData } = await supabase
      .from("users")
      .select("onboarding_completed_at")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    if (!userData?.onboarding_completed_at) {
      url.pathname = "/onboarding/welcome";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  // Authenticated user accessing app routes - check onboarding status
  if (user && pathname.startsWith("/") && !pathname.startsWith("/onboarding") && !isPublicRoute) {
    const { data: userData } = await supabase
      .from("users")
      .select("onboarding_completed_at")
      .eq("id", user.id)
      .single();

    // Redirect to onboarding if not completed
    if (!userData?.onboarding_completed_at) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding/welcome";
      return NextResponse.redirect(url);
    }
  }

  // User on onboarding pages who has completed onboarding - redirect to dashboard
  if (user && pathname.startsWith("/onboarding")) {
    const { data: userData } = await supabase
      .from("users")
      .select("onboarding_completed_at")
      .eq("id", user.id)
      .single();

    if (userData?.onboarding_completed_at) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
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
