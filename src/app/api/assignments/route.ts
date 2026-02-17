import { NextRequest } from "next/server";
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError } from "@/lib/api/response";
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const assignmentType = searchParams.get("assignmentType");
  const userId = searchParams.get("userId");
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");
  const eventId = searchParams.get("eventId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const overdue = searchParams.get("overdue");
  const myAssignments = searchParams.get("myAssignments");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // Build query
  let query = supabase
    .from("assignments")
    .select("*", { count: "exact" })
    .order("due_date", { ascending: true, nullsFirst: false });

  // Apply filters
  if (assignmentType) {
    query = query.eq("assignment_type", assignmentType);
  }

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (myAssignments === "true") {
    query = query.eq("user_id", user.id);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  if (eventId) {
    query = query.eq("event_id", eventId);
  }

  if (startDate) {
    query = query.gte("start_time", startDate);
  }

  if (endDate) {
    query = query.lte("end_time", endDate);
  }

  if (overdue === "true") {
    const today = new Date().toISOString().split("T")[0];
    query = query
      .lt("due_date", today)
      .not("status", "in", '("completed","cancelled","done")');
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    captureError(error, 'api.assignments.error');
    return supabaseError(error);
  }

  // Transform response
  const items = (data || []).map((assignment) => ({
    id: assignment.id,
    assignmentType: assignment.assignment_type,
    role: assignment.role,
    entityType: assignment.entity_type,
    entityId: assignment.entity_id,
    entityName: assignment.entity_name,
    entityPath: assignment.entity_path,
    userId: assignment.user_id,
    userName: assignment.user_name,
    status: assignment.status,
    priority: assignment.priority,
    startTime: assignment.start_time,
    endTime: assignment.end_time,
    dueDate: assignment.due_date,
    projectId: assignment.project_id,
    eventId: assignment.event_id,
    visibility: assignment.visibility,
    metadata: assignment.metadata,
    createdAt: assignment.created_at,
  }));

  return apiSuccess({
    items,
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    },
  });
}
