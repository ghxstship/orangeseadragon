export interface ApprovalActionPayload {
  id?: unknown;
  requestId?: unknown;
  ids?: unknown;
  requestIds?: unknown;
  reason?: unknown;
  comments?: unknown;
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function resolveApprovalRequestId(payload: ApprovalActionPayload): string | null {
  return toNonEmptyString(payload.id) || toNonEmptyString(payload.requestId);
}

export function resolveApprovalRequestIds(payload: ApprovalActionPayload): string[] {
  const candidate = Array.isArray(payload.ids)
    ? payload.ids
    : Array.isArray(payload.requestIds)
      ? payload.requestIds
      : [];

  return candidate
    .map((id) => toNonEmptyString(id))
    .filter((id): id is string => Boolean(id));
}

export function resolveApprovalComments(payload: ApprovalActionPayload): string | null {
  return toNonEmptyString(payload.reason) || toNonEmptyString(payload.comments);
}
