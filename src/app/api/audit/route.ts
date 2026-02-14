import { NextRequest } from "next/server";
import { requirePolicy } from "@/lib/api/guard";
import { apiSuccess, supabaseError } from "@/lib/api/response";

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export async function GET(request: NextRequest) {
  const auth = await requirePolicy("audit.read", { sensitivity: "high" });
  if (auth.error) return auth.error;
  const { supabase, membership } = auth;

  const searchParams = request.nextUrl.searchParams;
  const page = parseNumber(searchParams.get("page"), 1);
  const limit = parseNumber(searchParams.get("limit"), 50);
  const action = searchParams.get("action");
  const actorId = searchParams.get("actorId");
  const targetType = searchParams.get("targetType");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const organizationId = membership.organization_id;

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (organizationId) {
    query = query.eq("organization_id", organizationId);
  }

  if (action) {
    query = query.eq("action", action);
  }

  if (actorId) {
    query = query.eq("user_id", actorId);
  }

  if (targetType) {
    query = query.eq("entity_type", targetType);
  }

  if (startDate) {
    query = query.gte("created_at", startDate);
  }

  if (endDate) {
    query = query.lte("created_at", endDate);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return supabaseError(error);
  }

  const logs = (data ?? []).map((entry) => ({
    id: entry.id,
    action: entry.action,
    category: entry.entity_type ?? "system",
    severity: "info",
    actor: {
      id: entry.user_id ?? "system",
      type: entry.user_id ? "user" : "system",
    },
    target: entry.entity_id
      ? {
          type: entry.entity_type ?? "entity",
          id: entry.entity_id,
        }
      : undefined,
    description: `${entry.action} ${entry.entity_type ? `on ${entry.entity_type}` : ""}`.trim(),
    success: true,
    timestamp: entry.created_at,
    metadata: {
      oldValues: entry.old_values ?? null,
      newValues: entry.new_values ?? null,
    },
  }));

  const total = count ?? 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return apiSuccess({
    data: logs,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}
