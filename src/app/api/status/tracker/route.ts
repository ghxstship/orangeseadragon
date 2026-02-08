import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/guard";
import { apiSuccess, supabaseError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const entityType = searchParams.get("entityType");
  const currentStatus = searchParams.get("currentStatus");
  const statusCategory = searchParams.get("statusCategory");
  const projectId = searchParams.get("projectId");
  const eventId = searchParams.get("eventId");
  const changedAfter = searchParams.get("changedAfter");
  const overdue = searchParams.get("overdue");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // Build query
  let query = supabase
    .from("status_tracker")
    .select("*", { count: "exact" })
    .order("changed_at", { ascending: false });

  // Apply filters
  if (entityType) {
    query = query.eq("entity_type", entityType);
  }

  if (currentStatus) {
    query = query.eq("current_status", currentStatus);
  }

  if (statusCategory) {
    query = query.eq("status_category", statusCategory);
  }

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  if (eventId) {
    query = query.eq("event_id", eventId);
  }

  if (changedAfter) {
    query = query.gte("changed_at", changedAfter);
  }

  if (overdue === "true") {
    const today = new Date().toISOString().split("T")[0];
    query = query
      .lt("due_date", today)
      .not("status_category", "in", '("completed","cancelled")');
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching status tracker:", error);
    return supabaseError(error);
  }

  // Calculate category counts
  const categoryCounts = (data || []).reduce(
    (acc, item) => {
      const category = item.status_category || "unknown";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Transform response
  const items = (data || []).map((status) => ({
    id: status.id,
    entityType: status.entity_type,
    entityId: status.entity_id,
    entityName: status.entity_name,
    entityPath: status.entity_path,
    currentStatus: status.current_status,
    previousStatus: status.previous_status,
    statusCategory: status.status_category,
    changedBy: status.changed_by,
    changedAt: status.changed_at,
    projectId: status.project_id,
    eventId: status.event_id,
    priority: status.priority,
    dueDate: status.due_date,
    visibility: status.visibility,
    metadata: status.metadata,
    createdAt: status.created_at,
  }));

  return apiSuccess({
    items,
    categoryCounts,
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    },
  });
}
