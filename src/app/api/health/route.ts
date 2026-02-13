import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; latency_ms?: number; error?: string }> = {};

  // Supabase connectivity check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const start = Date.now();
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('organizations').select('id').limit(1);
      checks.supabase = error
        ? { status: 'error', latency_ms: Date.now() - start, error: error.message }
        : { status: 'ok', latency_ms: Date.now() - start };
    } catch (e) {
      checks.supabase = { status: 'error', latency_ms: Date.now() - start, error: e instanceof Error ? e.message : 'unknown' };
    }
  } else {
    checks.supabase = { status: 'error', error: 'Missing SUPABASE env vars' };
  }

  // Environment variable presence checks
  checks.env = {
    status: supabaseUrl && supabaseKey && process.env.SUPABASE_SERVICE_ROLE_KEY ? 'ok' : 'error',
    ...((!supabaseUrl || !supabaseKey || !process.env.SUPABASE_SERVICE_ROLE_KEY) && {
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
