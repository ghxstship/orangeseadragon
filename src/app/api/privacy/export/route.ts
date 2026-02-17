import { NextRequest } from "next/server";
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, serverError } from "@/lib/api/response";

/**
 * GET /api/privacy/export
 * GDPR Article 20 — Data Portability
 * Exports all personal data for the authenticated user as JSON.
 */
export async function GET(_request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;

    const { user, supabase } = auth;

    // Gather all user-related data across tables
    const [
      profileResult,
      membershipsResult,
      timeEntriesResult,
      activitiesResult,
      notificationsResult,
    ] = await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase.from("organization_members").select("*, roles(name)").eq("user_id", user.id),
      supabase.from("time_entries").select("*").eq("user_id", user.id).limit(1000),
      supabase.from("audit_logs").select("id, action, resource, resource_id, created_at, metadata").eq("user_id", user.id).limit(1000),
      supabase.from("notifications").select("*").eq("user_id", user.id).limit(500),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      dataSubject: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
      },
      profile: profileResult.data || null,
      organizationMemberships: membershipsResult.data || [],
      timeEntries: timeEntriesResult.data || [],
      activityLog: activitiesResult.data || [],
      notifications: notificationsResult.data || [],
    };

    return apiSuccess(exportData, {
      format: "json",
      gdpr_article: "20",
      description: "Complete personal data export",
    });
  } catch (_error) {
    return serverError("Failed to export user data");
  }
}
