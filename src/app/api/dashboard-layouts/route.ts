import { NextRequest } from "next/server";
import { z } from 'zod';
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from "@/lib/api/response";
import { captureError, extractRequestContext } from '@/lib/observability';

const createLayoutSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(255),
  description: z.string().max(2000).optional(),
  widgets: z.array(z.record(z.unknown())).min(1, 'widgets must contain at least one item'),
  columns: z.coerce.number().int().min(1).max(24).optional(),
  is_shared: z.boolean().optional(),
  is_default: z.boolean().optional(),
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
  const { user, supabase, membership } = auth;

  const organizationId = membership.organization_id;

  const { data, error } = await supabase
    .from("dashboard_layouts")
    .select("*")
    .is("deleted_at", null)
    .or(
      `user_id.eq.${user.id},and(is_shared.eq.true,organization_id.eq.${organizationId})`
    )
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    return supabaseError(error);
  }

  return apiSuccess(data);
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

  const parsedBody = createLayoutSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return badRequest('Validation failed', {
      issues: parsedBody.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const { name, description, widgets, columns, is_shared, is_default } = parsedBody.data;
  const organizationId = membership.organization_id;

  try {
    // If setting as default, unset other defaults
    if (is_default) {
      await supabase
        .from("dashboard_layouts")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true);
    }

    const { data, error } = await supabase
      .from("dashboard_layouts")
      .insert({
        name,
        description: description || null,
        widgets,
        columns: columns ?? 12,
        is_shared: is_shared ?? false,
        is_default: is_default ?? false,
        user_id: user.id,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiCreated(data);
  } catch (error) {
    if (isSupabaseError(error)) {
      return supabaseError(error);
    }

    captureError(error, 'api.dashboard-layouts.post.error', {
      organization_id: organizationId,
      user_id: user.id,
      ...requestContext,
    });
    return serverError('Failed to create dashboard layout');
  }
}
