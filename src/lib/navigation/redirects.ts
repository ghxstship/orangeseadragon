// /lib/navigation/redirects.ts

/**
 * REDIRECT MAP
 *
 * Backward-compatibility redirects are intentionally disabled.
 * We only support canonical routes and do not maintain legacy path aliases.
 */

export interface RouteRedirect {
  from: string;
  to: string;
  permanent: boolean;
  preserveQuery?: boolean;
  queryMapping?: Record<string, string>;  // Map old query params to new
}

export const routeRedirects: RouteRedirect[] = [];

// Generate Next.js config format
export function generateNextRedirects(): Array<{ source: string; destination: string; permanent: boolean }> {
  return routeRedirects.map(r => ({
    source: r.from,
    destination: r.to,
    permanent: r.permanent,
  }));
}
