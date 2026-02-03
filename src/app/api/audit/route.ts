import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export async function GET(request: NextRequest) {
  const supabase = await createServiceClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseNumber(searchParams.get("page"), 1);
  const limit = parseNumber(searchParams.get("limit"), 50);
  const action = searchParams.get("action");
  const actorId = searchParams.get("actorId");
  const targetType = searchParams.get("targetType");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let organizationId: string | null = null;
  const { data: role } = await supabase
    .from("user_roles")
    .select("organization_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  organizationId = role?.organization_id ?? null;

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
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  return NextResponse.json({
    data: logs,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}
