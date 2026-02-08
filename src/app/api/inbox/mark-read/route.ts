import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/guard";
import { apiSuccess, badRequest, supabaseError, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
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
    console.error("Failed to mark notifications as read:", error);
    return serverError('Failed to mark notifications as read');
  }
}
