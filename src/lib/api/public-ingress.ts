import { NextRequest } from "next/server";
import { badRequest, forbidden } from "@/lib/api/response";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { getAppHost } from "@/lib/env";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface PublicIngressPolicy {
  maxPayloadBytes: number;
  rateLimit: {
    prefix: string;
    maxTokens: number;
    refillRate: number;
  };
}

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function isTrustedHostRequest(request: NextRequest): boolean {
  try {
    const trustedHost = getAppHost();
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");

    const hasClientContext = Boolean(origin || referer);
    if (!hasClientContext) return false;

    if (origin && new URL(origin).host !== trustedHost) return false;
    if (referer && new URL(referer).host !== trustedHost) return false;

    return true;
  } catch {
    return false;
  }
}

export async function enforcePublicIngressPolicy(
  request: NextRequest,
  policy: PublicIngressPolicy
) {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > policy.maxPayloadBytes) {
    return badRequest("Request payload too large");
  }

  if (!isTrustedHostRequest(request)) {
    return forbidden("Untrusted request origin");
  }

  const rateLimitError = await checkRateLimit(request, {
    prefix: policy.rateLimit.prefix,
    maxTokens: policy.rateLimit.maxTokens,
    refillRate: policy.rateLimit.refillRate,
  });

  if (rateLimitError) {
    return rateLimitError;
  }

  return null;
}
