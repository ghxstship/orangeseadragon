import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiCreated, apiSuccess, badRequest, notFound, serverError, supabaseError } from '@/lib/api/response';
import { captureError, extractRequestContext } from '@/lib/observability';

const settlementQuerySchema = z.object({
  projectId: z.string().uuid('projectId must be a valid UUID'),
});

const settlementMutationSchema = z.object({
  projectId: z.string().uuid('projectId must be a valid UUID'),
  revenue: z.coerce.number().min(0).optional(),
  agencyFeePercent: z.coerce.number().min(0).max(100).optional(),
  laborItems: z.array(z.record(z.unknown())).optional(),
  vendorItems: z.array(z.record(z.unknown())).optional(),
  expenseItems: z.array(z.record(z.unknown())).optional(),
  adjustmentItems: z.array(z.record(z.unknown())).optional(),
  approvalStatus: z.string().trim().min(1).max(100).optional(),
  notes: z.string().max(10000).optional(),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSupabaseError(error: unknown): error is { message: string; code?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase, membership, user } = auth;
  const requestContext = extractRequestContext(request.headers);

  const parsedQuery = settlementQuerySchema.safeParse({
    projectId:
      request.nextUrl.searchParams.get('projectId') ||
      request.nextUrl.searchParams.get('project_id') ||
      undefined,
  });

  if (!parsedQuery.success) {
    return badRequest('Validation failed', {
      issues: parsedQuery.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const projectId = parsedQuery.data.projectId;

  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', projectId)
      .eq('organization_id', membership.organization_id)
      .maybeSingle();

    if (projectError) {
      return supabaseError(projectError);
    }

    if (!project) {
      return notFound('Project');
    }

    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    if (isSupabaseError(error)) {
      return supabaseError(error);
    }

    captureError(error, 'api.settlements.get.error', {
      project_id: projectId,
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to load settlement');
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

  const normalizedBody = isRecord(rawBody)
    ? {
        projectId:
          (typeof rawBody.projectId === 'string' && rawBody.projectId) ||
          (typeof rawBody.project_id === 'string' && rawBody.project_id) ||
          undefined,
        revenue: rawBody.revenue,
        agencyFeePercent:
          rawBody.agencyFeePercent !== undefined
            ? rawBody.agencyFeePercent
            : rawBody.agency_fee_percent,
        laborItems: rawBody.laborItems !== undefined ? rawBody.laborItems : rawBody.labor_items,
        vendorItems: rawBody.vendorItems !== undefined ? rawBody.vendorItems : rawBody.vendor_items,
        expenseItems: rawBody.expenseItems !== undefined ? rawBody.expenseItems : rawBody.expense_items,
        adjustmentItems:
          rawBody.adjustmentItems !== undefined ? rawBody.adjustmentItems : rawBody.adjustment_items,
        approvalStatus:
          rawBody.approvalStatus !== undefined ? rawBody.approvalStatus : rawBody.approval_status,
        notes: rawBody.notes,
      }
    : rawBody;

  const parsedBody = settlementMutationSchema.safeParse(normalizedBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const {
    projectId,
    revenue,
    agencyFeePercent,
    laborItems,
    vendorItems,
    expenseItems,
    adjustmentItems,
    approvalStatus,
    notes,
  } = parsedBody.data;

  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, organization_id')
      .eq('id', projectId)
      .eq('organization_id', membership.organization_id)
      .maybeSingle();

    if (projectError) {
      return supabaseError(projectError);
    }

    if (!project) {
      return notFound('Project');
    }

    const payload = {
      project_id: projectId,
      created_by: user.id,
      revenue: revenue ?? 0,
      agency_fee_percent: agencyFeePercent ?? 15,
      labor_items: laborItems ?? [],
      vendor_items: vendorItems ?? [],
      expense_items: expenseItems ?? [],
      adjustment_items: adjustmentItems ?? [],
      approval_status: approvalStatus ?? 'draft',
      notes: notes ?? '',
    };

    const { data: existing } = await supabase
      .from('settlements')
      .select('id')
      .eq('project_id', projectId)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('settlements')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) return supabaseError(error);
      result = data;
    } else {
      const { data, error } = await supabase
        .from('settlements')
        .insert(payload)
        .select()
        .single();
      if (error) return supabaseError(error);
      result = data;
    }

    return apiCreated(result);
  } catch (error) {
    if (isSupabaseError(error)) {
      return supabaseError(error);
    }

    captureError(error, 'api.settlements.post.error', {
      project_id: projectId,
      organization_id: membership.organization_id,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to save settlement');
  }
}
