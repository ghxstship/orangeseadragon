import { requireAuth } from "@/lib/api/guard";
import { apiSuccess, supabaseError, serverError } from "@/lib/api/response";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const { user, supabase } = auth;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(null);
  } catch (e) {
    console.error("[API] Mark read error:", e);
    return serverError();
  }
}
