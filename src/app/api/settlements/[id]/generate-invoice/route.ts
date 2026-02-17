import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, notFound, supabaseError, serverError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';

const settlementIdSchema = z.string().uuid('Settlement ID must be a valid UUID');

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

/**
 * POST /api/settlements/:id/generate-invoice
 * 
 * Generate a final invoice from an approved/finalized settlement.
 * Creates line items from settlement revenue/expense breakdown.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.write');
  if (auth.error) return auth.error;
  const { user, supabase, membership } = auth;
  const requestContext = extractRequestContext(request.headers);

  const { id: rawId } = await params;
  const parsedId = settlementIdSchema.safeParse(rawId);
  if (!parsedId.success) {
    return badRequest('Invalid settlement ID', {
      issues: parsedId.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const settlementId = parsedId.data;

  try {
    // Verify settlement belongs to user's organization via project
    const { data: settlement, error: fetchError } = await supabase
      .from('settlements')
      .select('id, project_id, projects!inner(organization_id)')
      .eq('id', settlementId)
      .maybeSingle();

    if (fetchError) {
      return supabaseError(fetchError);
    }

    if (!settlement) {
      return notFound('Settlement');
    }

    const projectRow = settlement.projects as unknown as { organization_id: string } | null;
    if (projectRow?.organization_id !== membership.organization_id) {
      return notFound('Settlement');
    }

    const { data, error } = await supabase.rpc('generate_invoice_from_settlement', {
      p_settlement_id: settlementId,
      p_user_id: user.id,
    });

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess({ invoice_id: data });
  } catch (error) {
    if (isSupabaseError(error)) {
      return supabaseError(error);
    }

    captureError(error, 'api.settlements.id.generate-invoice.error', {
      settlement_id: settlementId,
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to generate invoice from settlement');
  }
}
