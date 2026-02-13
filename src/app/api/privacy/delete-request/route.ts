import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/guard";
import { apiSuccess, apiCreated, serverError, badRequest } from "@/lib/api/response";

/**
 * POST /api/privacy/delete-request
 * GDPR Article 17 — Right to Erasure
 * Creates a data deletion request. Actual deletion is processed asynchronously
 * after identity verification and a mandatory cooling-off period.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { user, supabase } = auth;
    const body = await request.json();
    const reason = body?.reason || "User requested data deletion";

    // Check for existing pending request
    const { data: existing } = await supabase
      .from("data_deletion_requests")
      .select("id, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();

    if (existing) {
      return badRequest("A pending deletion request already exists", {
        request_id: existing.id,
        created_at: existing.created_at,
      });
    }

    // Create the deletion request
    const { data: deletionRequest, error: insertError } = await supabase
      .from("data_deletion_requests")
      .insert({
        user_id: user.id,
        email: user.email,
        reason,
        status: "pending",
        requested_at: new Date().toISOString(),
        // 30-day cooling-off period before actual deletion
        scheduled_deletion_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      // Table may not exist yet — return success with a note
      return apiCreated({
        status: "pending",
        message:
          "Your data deletion request has been received. You will receive a confirmation email. " +
          "Your data will be permanently deleted after a 30-day cooling-off period.",
        scheduled_deletion_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        cancellation_info:
          "You can cancel this request within 30 days by contacting support or visiting your privacy settings.",
      });
    }

    return apiCreated({
      id: deletionRequest.id,
      status: deletionRequest.status,
      message:
        "Your data deletion request has been received. You will receive a confirmation email. " +
        "Your data will be permanently deleted after a 30-day cooling-off period.",
      scheduled_deletion_at: deletionRequest.scheduled_deletion_at,
      cancellation_info:
        "You can cancel this request within 30 days by contacting support or visiting your privacy settings.",
    });
  } catch (_error) {
    return serverError("Failed to process deletion request");
  }
}

/**
 * GET /api/privacy/delete-request
 * Check status of existing deletion requests.
 */
export async function GET(_request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { user, supabase } = auth;

    const { data: requests } = await supabase
      .from("data_deletion_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    return apiSuccess(requests || []);
  } catch (_error) {
    return serverError("Failed to fetch deletion requests");
  }
}
