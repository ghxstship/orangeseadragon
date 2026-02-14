import { createUntypedClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { apiSuccess, badRequest, serverError } from "@/lib/api/response";
import { enforcePublicIngressPolicy, isValidUuid } from "@/lib/api/public-ingress";
import { captureError } from "@/lib/observability";

export async function POST(request: NextRequest) {
    try {
        const ingressError = await enforcePublicIngressPolicy(request, {
            maxPayloadBytes: 2_048,
            rateLimit: {
                prefix: "public:track-click",
                maxTokens: 240,
                refillRate: 240 / 300,
            },
        });
        if (ingressError) return ingressError;

        const { linkId } = await request.json();

        if (!linkId || typeof linkId !== "string" || !isValidUuid(linkId)) {
            return badRequest("Valid link ID required");
        }

        const supabase = await createUntypedClient();

        // Call the database function to log click
        const { error } = await supabase.rpc("log_link_click", {
            p_link_id: linkId,
            p_referrer: null,
            p_session_id: null,
        });

        if (error) {
            captureError(error, "api.public.track_click.log_failed", { linkId });
        }

        return apiSuccess(null);
    } catch (error) {
        captureError(error, "api.public.track_click.unhandled_error");
        return serverError();
    }
}
