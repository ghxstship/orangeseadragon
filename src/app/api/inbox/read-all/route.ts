import { requireAuth } from "@/lib/api/guard";
import { apiSuccess, supabaseError, serverError } from "@/lib/api/response";

export async function POST() {
  try {
    const auth = await requireAuth();
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
    console.error("[API] Mark all read error:", e);
    return serverError();
  }
}
