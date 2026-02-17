import { NextRequest } from "next/server";
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError } from "@/lib/api/response";

const parseBoolean = (value: string | null) => {
  if (value === null) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const searchParams = request.nextUrl.searchParams;
  const page = parseNumber(searchParams.get("page"), 1);
  const limit = parseNumber(searchParams.get("limit"), 20);
  const read = parseBoolean(searchParams.get("read"));
  const type = searchParams.get("type");

  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (read !== undefined) {
    query = query.eq("is_read", read);
  }

  if (type) {
    query = query.eq("type", type);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return supabaseError(error);
  }

  const { count: unreadCount, error: unreadError } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (unreadError) {
    return supabaseError(unreadError);
  }

  const notifications = (data ?? []).map((item) => {
    const dataPayload = item.data as Record<string, unknown> | null;
    const actionUrl = dataPayload?.actionUrl || dataPayload?.action_url;

    return {
      id: item.id,
      type: item.type,
      title: item.title,
      message: item.message,
      read: item.is_read ?? false,
      data: item.data ?? undefined,
      actionUrl,
      action_url: actionUrl,
      userId: item.user_id,
      createdAt: item.created_at,
      readAt: item.read_at,
      timestamp: item.created_at,
    };
  });

  const total = count ?? 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return apiSuccess(notifications, {
    page,
    limit,
    total,
    totalPages,
    unreadCount: unreadCount ?? 0,
  });
}
