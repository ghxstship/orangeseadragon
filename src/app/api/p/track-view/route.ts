import { createUntypedClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { apiSuccess, badRequest, serverError } from "@/lib/api/response";
import { enforcePublicIngressPolicy, isValidUuid } from "@/lib/api/public-ingress";
import { captureError } from "@/lib/observability";

export async function POST(request: NextRequest) {
    try {
        const ingressError = await enforcePublicIngressPolicy(request, {
            maxPayloadBytes: 4_096,
            rateLimit: {
                prefix: "public:track-view",
                maxTokens: 120,
                refillRate: 120 / 300,
            },
        });
        if (ingressError) return ingressError;

        const { profileId, referrer, userAgent } = await request.json();

        if (!profileId || typeof profileId !== "string" || !isValidUuid(profileId)) {
            return badRequest("Valid profile ID required");
        }

        const supabase = await createUntypedClient();

        // Call the database function to log view and increment count
        const { error } = await supabase.rpc("log_profile_view", {
            p_profile_id: profileId,
            p_referrer: referrer || null,
            p_user_agent: userAgent || null,
            p_session_id: null,
        });

        if (error) {
            captureError(error, "api.public.track_view.log_failed", { profileId });
            // Don't fail the request - analytics should be non-blocking
        }

        return apiSuccess(null);
    } catch (error) {
        captureError(error, "api.public.track_view.unhandled_error");
        return serverError();
    }
}
