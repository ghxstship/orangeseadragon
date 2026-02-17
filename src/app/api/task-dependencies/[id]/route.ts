import { NextRequest } from "next/server";
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiNoContent, badRequest, supabaseError, serverError } from "@/lib/api/response";
import { captureError } from '@/lib/observability';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const { id } = await params;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.dependency_type !== undefined) {
      updates.dependency_type = body.dependency_type;
    }
    if (body.lag_hours !== undefined) {
      updates.lag_hours = body.lag_hours;
    }

    if (Object.keys(updates).length === 0) {
      return badRequest("No valid fields to update");
    }

    const { data, error } = await supabase
      .from("task_dependencies")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        depends_on_task:tasks!task_dependencies_depends_on_task_id_fkey(
          id,
          title,
          status
        )
      `)
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    captureError(error, 'api.task-dependencies.id.error');
    return serverError("Failed to update task dependency");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const { id } = await params;

  const { error } = await supabase
    .from("task_dependencies")
    .delete()
    .eq("id", id);

  if (error) {
    return supabaseError(error);
  }

  return apiNoContent();
}
