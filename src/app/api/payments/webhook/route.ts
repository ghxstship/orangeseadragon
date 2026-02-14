import { apiError } from "@/lib/api/response";

/**
 * Deprecated endpoint.
 * Canonical Stripe webhook endpoint: POST /api/webhooks/stripe
 */
export async function POST() {
  return apiError(
    "WEBHOOK_ENDPOINT_DEPRECATED",
    "Use /api/webhooks/stripe for Stripe webhook delivery.",
    410,
    { replacement: "/api/webhooks/stripe" }
  );
}
