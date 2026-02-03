import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
  const supabase = await createServiceClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  const total = type ? filtered.length : count ?? filtered.length;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  const unreadCount = filtered.filter((item) => !item.read).length;

  return NextResponse.json({
    data: filtered,
    meta: {
      page,
      limit,
      total,
      totalPages,
      unreadCount,
    },
  });
}
