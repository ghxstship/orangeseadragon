import { NextRequest } from "next/server";
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, badRequest, supabaseError, serverError } from "@/lib/api/response";
import { captureError } from '@/lib/observability';

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {
    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return badRequest('ids must be a non-empty array');
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in("id", ids)
      .eq("user_id", user.id);

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess({ count: ids.length });
  } catch (error) {
    captureError(error, 'api.inbox.mark-read.error');
    return serverError('Failed to mark notifications as read');
  }
}
