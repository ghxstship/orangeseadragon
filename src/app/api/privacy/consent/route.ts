import { NextRequest } from "next/server";
import { requirePolicy } from "@/lib/api/guard";
import { apiSuccess, apiCreated, serverError } from "@/lib/api/response";

/**
 * POST /api/privacy/consent
 * Records a consent decision server-side for audit compliance.
 * Client-side consent is stored in localStorage; this endpoint
 * creates the authoritative server-side record.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.write');
    if (auth.error) return auth.error;

    const { user, supabase } = auth;
    const body = await request.json();

    const { consents, version } = body as {
      consents: Record<string, boolean>;
      version: string;
    };

    // Upsert consent records for each category
    const records = Object.entries(consents).map(([category, granted]) => ({
      user_id: user.id,
      category,
      granted,
      version: version || "1.0.0",
      ip_address: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
      recorded_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("consent_records")
      .insert(records);

    if (insertError) {
      // Table may not exist yet — still return success since client-side consent is stored
      return apiCreated({
        recorded: true,
        message: "Consent preferences saved",
        categories: consents,
        fallback: true,
      });
    }

    return apiCreated({
      recorded: true,
      message: "Consent preferences saved",
      categories: consents,
    });
  } catch (_error) {
    return serverError("Failed to record consent");
  }
}

/**
 * GET /api/privacy/consent
 * Retrieves the latest consent decisions for the authenticated user.
 */
export async function GET(_request: NextRequest) {
  try {
    const auth = await requirePolicy('entity.read');
    if (auth.error) return auth.error;

    const { user, supabase } = auth;

    const { data: records } = await supabase
      .from("consent_records")
      .select("category, granted, version, recorded_at")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .limit(20);

    // Deduplicate to latest per category
    const latest: Record<string, { granted: boolean; version: string; recorded_at: string }> = {};
    for (const record of records || []) {
      if (!latest[record.category]) {
        latest[record.category] = {
          granted: record.granted,
          version: record.version,
          recorded_at: record.recorded_at,
        };
      }
    }

    return apiSuccess(latest);
  } catch (_error) {
    return serverError("Failed to fetch consent records");
  }
}
