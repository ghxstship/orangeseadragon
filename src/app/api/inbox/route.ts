import { NextRequest } from "next/server";
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError } from "@/lib/api/response";

type InboxStatus = "unread" | "read" | "actioned" | "dismissed";
type InboxPriority = "low" | "normal" | "high" | "urgent";
type InboxType = "approval" | "mention" | "alert" | "assignment" | "comment" | "update";

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

const dbFilterableTypes = new Set(["message", "approval", "review", "mention", "assignment"]);

const normalizeType = (rawType: string): InboxType => {
  switch (rawType) {
    case "approval":
    case "mention":
    case "alert":
    case "assignment":
    case "comment":
    case "update":
      return rawType;
    case "message":
      return "comment";
    case "review":
      return "update";
    default:
      return "update";
  }
};

const normalizeSourceEntity = (
  payload: Record<string, unknown> | null,
  entityType: string | null,
  type: InboxType,
): string => {
  const sourceEntity = (payload?.source_entity as string)
    || (payload?.sourceEntity as string)
    || entityType
    || null;

  if (sourceEntity) {
    return sourceEntity;
  }

  if (type === "approval") return "workflow_run";
  if (type === "comment" || type === "mention") return "comment";
  if (type === "assignment") return "task";
  return "task";
};

const normalizeStatus = (
  payload: Record<string, unknown> | null,
  isRead: boolean | null,
): InboxStatus => {
  const payloadStatus = ((payload?.status as string) || "").toLowerCase();
  if (payloadStatus === "unread" || payloadStatus === "read" || payloadStatus === "actioned" || payloadStatus === "dismissed") {
    return payloadStatus;
  }

  if (payload?.dismissed_at || payload?.dismissedAt) return "dismissed";
  if (payload?.actioned_at || payload?.actionedAt || payload?.action_type || payload?.actionType) return "actioned";
  return isRead ? "read" : "unread";
};

const normalizePriority = (payload: Record<string, unknown> | null): InboxPriority => {
  const rawPriority = ((payload?.priority as string) || "normal").toLowerCase();
  if (rawPriority === "low" || rawPriority === "normal" || rawPriority === "high" || rawPriority === "urgent") {
    return rawPriority;
  }
  return "normal";
};

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const searchParams = request.nextUrl.searchParams;
  const page = parseNumber(searchParams.get("page"), 1);
  const limit = Math.min(parseNumber(searchParams.get("limit"), 50), 100);
  const statusFilterRaw = (searchParams.get("status") || "").toLowerCase();
  const statusFilter = (
    statusFilterRaw === "unread"
    || statusFilterRaw === "read"
    || statusFilterRaw === "actioned"
    || statusFilterRaw === "dismissed"
  )
    ? statusFilterRaw
    : undefined;
  const read = parseBoolean(searchParams.get("read"))
    ?? (statusFilter === "unread" ? false : statusFilter === "read" ? true : undefined);
  const type = (searchParams.get("type") || "").toLowerCase() || undefined;
  const canFilterTypeInDb = Boolean(type && dbFilterableTypes.has(type));
  const summaryOnly = searchParams.get("summary") === "1" || searchParams.get("summary") === "true";

  if (summaryOnly) {
    let unreadCount = 0;

    if (!statusFilter || statusFilter === "unread") {
      let unreadQuery = supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (canFilterTypeInDb && type) {
        unreadQuery = unreadQuery.eq("type", type);
      }

      const { count: unreadCountResult, error: unreadCountError } = await unreadQuery;
      unreadCount = unreadCountError ? 0 : unreadCountResult ?? 0;
    }

    return apiSuccess([], {
      page,
      limit,
      total: 0,
      totalPages: 0,
      unreadCount,
    });
  }

  let query = supabase
    .from("notifications")
    .select("id,type,title,message,is_read,created_at,data,entity_type,entity_id", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (read !== undefined) {
    query = query.eq("is_read", read);
  }

  if (canFilterTypeInDb && type) {
    query = query.eq("type", type);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return supabaseError(error);
  }

  const mapped = (data ?? []).map((item) => {
    const payload = item.data as Record<string, unknown> | null;
    const rawType = ((payload?.inboxType as string) || (item.type as string) || "update").toLowerCase();
    const inboxType = normalizeType(rawType);

    const senderPayload = (payload?.sender as Record<string, unknown>)
      || (payload?.from_user as Record<string, unknown>)
      || (payload?.fromUser as Record<string, unknown>)
      || undefined;

    const hasSender = Boolean(
      senderPayload?.id
      || senderPayload?.name
      || senderPayload?.avatar_url
      || senderPayload?.avatarUrl,
    );

    const sender = hasSender
      ? {
          id: String(senderPayload?.id || ""),
          name: String(senderPayload?.name || ""),
          avatar_url: (senderPayload?.avatar_url as string) || (senderPayload?.avatarUrl as string) || undefined,
        }
      : undefined;

    const status = normalizeStatus(payload, item.is_read ?? false);
    const sourceEntity = normalizeSourceEntity(payload, item.entity_type, inboxType);
    const sourceId = (payload?.source_id as string)
      || (payload?.sourceId as string)
      || item.entity_id
      || item.id;
    const body = item.message
      || (payload?.body as string)
      || (payload?.description as string)
      || undefined;
    const actionUrl = (payload?.actionUrl as string)
      || (payload?.action_url as string)
      || undefined;
    const dueAt = (payload?.due_at as string)
      || (payload?.dueAt as string)
      || undefined;
    const priority = normalizePriority(payload);

    return {
      id: item.id,
      type: inboxType,
      title: item.title ?? item.message ?? "Notification",
      body,
      description: body,
      source_entity: sourceEntity,
      source_id: sourceId,
      status,
      priority,
      due_at: dueAt,
      created_at: item.created_at,
      from_user: sender,
      read: status !== "unread",
      actionUrl,
      createdAt: item.created_at,
      sender: sender
        ? {
            id: sender.id,
            name: sender.name,
            avatarUrl: sender.avatar_url,
          }
        : undefined,
    };
  });

  let filtered = mapped;

  if (type) {
    filtered = filtered.filter((item) => item.type === type);
  }

  if (statusFilter) {
    filtered = filtered.filter((item) => item.status === statusFilter);
  }

  let unreadCount = 0;
  let total = canFilterTypeInDb && !statusFilter ? count ?? filtered.length : filtered.length;

  if (type && canFilterTypeInDb && !statusFilter) {
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

  if (!statusFilter || statusFilter === "unread") {
    let unreadQuery = supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (canFilterTypeInDb && type) {
      unreadQuery = unreadQuery.eq("type", type);
    }

    const { count: unreadCountResult, error: unreadCountError } = await unreadQuery;
    if (!unreadCountError) {
      unreadCount = unreadCountResult ?? 0;
    } else {
      unreadCount = filtered.filter((item) => item.status === "unread").length;
    }
  } else {
    unreadCount = 0;
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
