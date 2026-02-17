import { NextRequest } from 'next/server';
import { requirePolicy } from '@/lib/api/guard';
import { apiCreated, badRequest, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';
import {
  createProposalFromBuilderPayload,
  proposalBuilderPayloadSchema,
} from '@/lib/services/proposal-builder.service';

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

/**
 * G4: Save proposal draft.
 */
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

  const parsedBody = proposalBuilderPayloadSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  try {
    const result = await createProposalFromBuilderPayload({
      supabase,
      organizationId: membership.organization_id,
      userId: user.id,
      payload: parsedBody.data,
      status: 'draft',
    });

    return apiCreated(result.proposal, {
      message: 'Proposal draft saved',
    });
  } catch (error) {
    if (isSupabaseError(error)) {
      return supabaseError(error);
    }

    captureError(error, 'api.proposals.save.unhandled_error', {
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to save proposal draft');
  }
}
