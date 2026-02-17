import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from "@/lib/api/response";
import { captureError } from '@/lib/observability';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { id } = await params;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(null);
  } catch (e) {
    captureError(e, 'api.inbox.id.read.error');
    return serverError('Failed to mark notification as read');
  }
}
