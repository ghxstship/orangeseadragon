import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError, serverError } from "@/lib/api/response";
import { captureError } from '@/lib/observability';

export async function POST() {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(null);
  } catch (e) {
    captureError(e, 'api.inbox.read-all.error');
    return serverError('Failed to mark all as read');
  }
}
