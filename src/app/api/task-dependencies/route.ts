import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/guard";
import { apiSuccess, apiCreated, badRequest, conflict, supabaseError, serverError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  const searchParams = request.nextUrl.searchParams;
  const taskId = searchParams.get("task_id");

  if (!taskId) {
    return badRequest('task_id is required');
  }

  const { data, error } = await supabase
    .from("task_dependencies")
    .select(`
      *,
      depends_on_task:tasks!task_dependencies_depends_on_task_id_fkey(
        id,
        title,
        status
      )
    `)
    .eq("task_id", taskId);

  if (error) {
    return supabaseError(error);
  }

  return apiSuccess(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  try {
    const body = await request.json();
    const { task_id, depends_on_task_id, dependency_type, lag_hours } = body;

    if (!task_id || !depends_on_task_id) {
      return badRequest('task_id and depends_on_task_id are required');
    }

    // Prevent self-dependency
    if (task_id === depends_on_task_id) {
      return badRequest('A task cannot depend on itself');
    }

    // Check for circular dependency
    const { data: existingDeps } = await supabase
      .from("task_dependencies")
      .select("task_id, depends_on_task_id")
      .or(`task_id.eq.${depends_on_task_id},depends_on_task_id.eq.${task_id}`);

    const wouldCreateCycle = existingDeps?.some(
      (dep) => dep.task_id === depends_on_task_id && dep.depends_on_task_id === task_id
    );

    if (wouldCreateCycle) {
      return badRequest('This dependency would create a circular reference');
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from("task_dependencies")
      .select("id")
      .eq("task_id", task_id)
      .eq("depends_on_task_id", depends_on_task_id)
      .single();

    if (existing) {
      return conflict('This dependency already exists');
    }

    const { data, error } = await supabase
      .from("task_dependencies")
      .insert({
        task_id,
        depends_on_task_id,
        dependency_type: dependency_type || "finish_to_start",
        lag_hours: lag_hours || 0,
      })
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

    return apiCreated(data);
  } catch (error) {
    console.error("Failed to create task dependency:", error);
    return serverError('Failed to create task dependency');
  }
}
