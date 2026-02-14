import { NextRequest } from "next/server";
import { handleStripeWebhookRequest } from "@/lib/integrations/stripe/webhook-handler";

export async function POST(request: NextRequest) {
  return handleStripeWebhookRequest(request);
}
