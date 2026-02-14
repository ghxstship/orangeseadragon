import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerEnv, getServiceRoleKey } from '@/lib/env';
import { captureError } from '@/lib/observability';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; latency_ms?: number; error?: string }> = {};

  let supabaseUrl: string | null = null;
  let supabaseKey: string | null = null;
  let serviceRoleKeyPresent = false;

  try {
    const env = getServerEnv();
    supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    getServiceRoleKey();
    serviceRoleKeyPresent = true;
  } catch (error) {
    captureError(error, 'health.env_validation_failed');
  }

  if (supabaseUrl && supabaseKey) {
    const start = Date.now();
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('organizations').select('id').limit(1);
      checks.supabase = error
        ? { status: 'error', latency_ms: Date.now() - start, error: error.message }
        : { status: 'ok', latency_ms: Date.now() - start };
    } catch (e) {
      captureError(e, 'health.supabase_connectivity_failed');
      checks.supabase = { status: 'error', latency_ms: Date.now() - start, error: e instanceof Error ? e.message : 'unknown' };
    }
  } else {
    checks.supabase = { status: 'error', error: 'Missing SUPABASE env vars' };
  }

  // Environment variable presence checks
  checks.env = {
    status: supabaseUrl && supabaseKey && serviceRoleKeyPresent ? 'ok' : 'error',
    ...((!supabaseUrl || !supabaseKey || !serviceRoleKeyPresent) && {
      error: 'Missing required environment variables',
    }),
  };

  const allOk = Object.values(checks).every(c => c.status === 'ok');

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      version: process.env.npm_package_version ?? '0.1.0',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
