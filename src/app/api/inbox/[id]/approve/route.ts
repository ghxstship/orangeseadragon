import { NextRequest } from "next/server";
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, notFound, supabaseError, serverError } from "@/lib/api/response";
import { captureError } from '@/lib/observability';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { id } = await params;

  try {
    // Get the notification to find the source entity
    const { data: notification, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !notification) {
      return notFound('Notification');
    }

    const payload = notification.data as Record<string, unknown> | null;
    const sourceEntity = payload?.source_entity as string | undefined;
    const sourceId = payload?.source_id as string | undefined;

    // Update the notification as actioned
    const { error: updateError } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        actioned_at: new Date().toISOString(),
        action_type: "approved",
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      return supabaseError(updateError);
    }

    // If this is a document approval, update the document status
    if (sourceEntity === "document" && sourceId) {
      await supabase
        .from("documents")
        .update({ approval_status: "approved" })
        .eq("id", sourceId);
    }

    // If this is a workflow approval, trigger the next step
    if (sourceEntity === "workflow_run" && sourceId) {
      await supabase
        .from("workflow_runs")
        .update({ 
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq("id", sourceId);
    }

    return apiSuccess({
      action: "approved",
      sourceEntity,
      sourceId,
    });
  } catch (error) {
    captureError(error, 'api.inbox.id.approve.error');
    return serverError('Failed to process approval');
  }
}
