import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';

const createEmailAccountSchema = z.object({
  provider: z.string().trim().min(1, 'provider is required').max(100),
  email_address: z.string().email('email_address must be a valid email'),
  display_name: z.string().trim().max(255).optional(),
  access_token: z.string().max(4096).optional(),
  refresh_token: z.string().max(4096).optional(),
  token_expires_at: z.string().datetime().optional().nullable(),
  smtp_host: z.string().max(255).optional().nullable(),
  smtp_port: z.coerce.number().int().min(1).max(65535).optional().nullable(),
  smtp_username: z.string().max(255).optional().nullable(),
  smtp_password: z.string().max(1024).optional().nullable(),
  smtp_use_tls: z.boolean().optional(),
  sync_enabled: z.boolean().optional(),
  sync_from_date: z.string().datetime().optional().nullable(),
  is_default: z.boolean().optional(),
  signature_html: z.string().max(50000).optional().nullable(),
  signature_text: z.string().max(10000).optional().nullable(),
});

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership, user } = auth;

  try {
    const { data: accounts, error } = await supabase
      .from('email_accounts')
      .select('id, email_address, display_name, provider, is_default, sync_enabled, last_sync_at, sync_status')
      .eq('organization_id', membership.organization_id)
      .eq('user_id', user.id)
      .eq('sync_enabled', true)
      .order('is_default', { ascending: false });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(accounts || [], { total: accounts?.length || 0 });
  } catch (error) {
    if (isSupabaseError(error)) return supabaseError(error);
    captureError(error, 'api.email-accounts.get.error', {
      organization_id: membership.organization_id,
      user_id: user.id,
    });
    return serverError('Failed to load email accounts');
  }
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { user, supabase, membership } = auth;
  const requestContext = extractRequestContext(request.headers);

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return badRequest('Invalid JSON request body');
  }

  const parsedBody = createEmailAccountSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const body = parsedBody.data;

  try {
    const { data: account, error } = await supabase
      .from('email_accounts')
      .insert({
        organization_id: membership.organization_id,
        user_id: user.id,
        provider: body.provider,
        email_address: body.email_address,
        display_name: body.display_name,
        access_token: body.access_token,
        refresh_token: body.refresh_token,
        token_expires_at: body.token_expires_at,
        smtp_host: body.smtp_host,
        smtp_port: body.smtp_port,
        smtp_username: body.smtp_username,
        smtp_password: body.smtp_password,
        smtp_use_tls: body.smtp_use_tls,
        sync_enabled: body.sync_enabled ?? true,
        sync_from_date: body.sync_from_date,
        is_default: body.is_default ?? false,
        signature_html: body.signature_html,
        signature_text: body.signature_text,
      })
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiCreated(account);
  } catch (error) {
    if (isSupabaseError(error)) return supabaseError(error);
    captureError(error, 'api.email-accounts.post.error', {
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to create email account');
  }
}
