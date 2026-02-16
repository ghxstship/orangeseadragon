import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/guard";
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

const allowedInboxTypes = new Set(["message", "approval", "review", "mention", "assignment"]);

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const searchParams = request.nextUrl.searchParams;
  const page = parseNumber(searchParams.get("page"), 1);
  const limit = parseNumber(searchParams.get("limit"), 20);
  const read = parseBoolean(searchParams.get("read"));
  const type = searchParams.get("type");
  const summaryOnly = searchParams.get("summary") === "1" || searchParams.get("summary") === "true";

  if (summaryOnly) {
    let unreadQuery = supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (type) {
      unreadQuery = unreadQuery.eq("type", type);
    }

    const { count: unreadCountResult, error: unreadCountError } = await unreadQuery;

    return apiSuccess([], {
      page,
      limit,
      total: 0,
      totalPages: 0,
      unreadCount: unreadCountError ? 0 : unreadCountResult ?? 0,
    });
  }

  let query = supabase
    .from("notifications")
    .select("id,type,title,message,is_read,created_at,data", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (read !== undefined) {
    query = query.eq("is_read", read);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return supabaseError(error);
  }

  const mapped = (data ?? []).map((item) => {
    const payload = item.data as Record<string, unknown> | null;
    const rawType = (payload?.inboxType as string) || (item.type as string) || "message";
    const inboxType = allowedInboxTypes.has(rawType) ? rawType : "message";
    const sender = payload?.sender as
      | { id?: string; name?: string; avatarUrl?: string }
      | undefined;

    return {
      id: item.id,
      type: inboxType,
      title: item.title ?? item.message ?? "Notification",
      description: item.message ?? undefined,
      read: item.is_read ?? false,
      actionUrl: (payload?.actionUrl as string) || (payload?.action_url as string) || undefined,
      createdAt: item.created_at,
      sender: sender?.id || sender?.name || sender?.avatarUrl ? {
        id: sender?.id || "",
        name: sender?.name || "",
        avatarUrl: sender?.avatarUrl,
      } : undefined,
    };
  });

  const filtered = type ? mapped.filter((item) => item.type === type) : mapped;
  let unreadCount = 0;
  let total = type ? 0 : count ?? filtered.length;

  if (type) {
    const { count: typeCount, error: typeCountError } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", type);

    if (!typeCountError) {
      total = typeCount ?? 0;
    } else {
      total = filtered.length;
    }
  }

  let unreadQuery = supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (type) {
    unreadQuery = unreadQuery.eq("type", type);
  }

  const { count: unreadCountResult, error: unreadCountError } = await unreadQuery;
  if (!unreadCountError) {
    unreadCount = unreadCountResult ?? 0;
  }

  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return apiSuccess(filtered, {
    page,
    limit,
    total,
    totalPages,
    unreadCount,
  });
}
