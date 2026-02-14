import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getServerEnv, getServiceRoleKey } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const env = getServerEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates an untyped Supabase client for routes with deeply nested relational queries.
 * Use this when the typed client causes TypeScript "excessively deep" errors.
 */
export async function createUntypedClient() {
  const cookieStore = await cookies();
  const env = getServerEnv();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored
          }
        },
      },
    }
  );
}

/**
 * Creates a Supabase client with service role key that bypasses RLS.
 * Use this ONLY for server-side operations that need full database access.
 * WARNING: This bypasses all Row Level Security - use with caution.
 */
export async function createServiceClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const env = getServerEnv();
  const serviceRoleKey = getServiceRoleKey();

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
