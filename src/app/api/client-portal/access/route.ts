import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';
import { apiSuccess, badRequest, notFound, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';

const clientPortalAccessQuerySchema = z.object({
  token: z.string().trim().min(1, 'token is required').max(1024),
});

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

type PortalAccessRecord = {
  id: string;
  organization_id: string;
  access_level: string;
  magic_link_expires_at: string | null;
  is_active: boolean;
  can_view_budgets: boolean | null;
  can_view_invoices: boolean | null;
  can_view_tasks: boolean | null;
  can_view_documents: boolean | null;
  can_view_reports: boolean | null;
  can_comment: boolean | null;
  can_approve: boolean | null;
  can_upload: boolean | null;
  custom_welcome_message: string | null;
  login_count: number | null;
};

export async function GET(request: NextRequest) {
  const requestContext = extractRequestContext(request.headers);

  const parsedQuery = clientPortalAccessQuerySchema.safeParse({
    token: request.nextUrl.searchParams.get('token') ?? '',
  });

  if (!parsedQuery.success) {
    return badRequest('Validation failed', {
      issues: parsedQuery.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const token = parsedQuery.data.token;

  try {
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from('client_portal_access')
      .select('id, organization_id, access_level, magic_link_expires_at, is_active, can_view_budgets, can_view_invoices, can_view_tasks, can_view_documents, can_view_reports, can_comment, can_approve, can_upload, custom_welcome_message, login_count')
      .eq('magic_link_token', token)
      .maybeSingle();

    if (error) {
      return supabaseError(error);
    }

    if (!data || !data.is_active) {
      return notFound('Portal access');
    }

    const access = data as PortalAccessRecord;

    if (access.magic_link_expires_at && new Date(access.magic_link_expires_at).getTime() < Date.now()) {
      return badRequest('Portal link has expired', { expired: true });
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('id, name, logo_url')
      .eq('id', access.organization_id)
      .maybeSingle();

    await supabase
      .from('client_portal_access')
      .update({
        last_login_at: new Date().toISOString(),
        login_count: (access.login_count ?? 0) + 1,
      })
      .eq('id', access.id);

    return apiSuccess({
      organization: {
        id: org?.id ?? access.organization_id,
        name: org?.name ?? 'Client Portal',
        logo_url: org?.logo_url ?? null,
      },
      access: {
        access_level: access.access_level,
        permissions: {
          can_view_budgets: access.can_view_budgets ?? false,
          can_view_invoices: access.can_view_invoices ?? true,
          can_view_tasks: access.can_view_tasks ?? false,
          can_view_documents: access.can_view_documents ?? true,
          can_view_reports: access.can_view_reports ?? false,
          can_comment: access.can_comment ?? true,
          can_approve: access.can_approve ?? false,
          can_upload: access.can_upload ?? false,
        },
        welcome_message: access.custom_welcome_message,
        expires_at: access.magic_link_expires_at,
      },
    });
  } catch (error) {
    if (isSupabaseError(error)) {
      return supabaseError(error);
    }

    captureError(error, 'api.client-portal.access.error', {
      ...requestContext,
    });
    return serverError('Failed to validate portal access');
  }
}
