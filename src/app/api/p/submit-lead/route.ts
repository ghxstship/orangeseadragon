import { createUntypedClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { apiSuccess, badRequest, serverError } from "@/lib/api/response";
import { enforcePublicIngressPolicy, isValidUuid } from "@/lib/api/public-ingress";
import { captureError } from "@/lib/observability";

const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 2000;
const ALLOWED_LEAD_TYPES = new Set(["contact", "newsletter"]);

export async function POST(request: NextRequest) {
    try {
        const ingressError = await enforcePublicIngressPolicy(request, {
            maxPayloadBytes: 8_192,
            rateLimit: {
                prefix: "public:submit-lead",
                maxTokens: 10,
                refillRate: 10 / 900,
            },
        });
        if (ingressError) return ingressError;

        const { profileId, name, email, message, leadType } = await request.json();

        if (!profileId || typeof profileId !== "string" || !isValidUuid(profileId)) {
            return badRequest("Valid profile ID is required");
        }

        if (!email || typeof email !== "string") {
            return badRequest("Profile ID and email are required");
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email) || email.length > 254) {
            return badRequest("Invalid email format");
        }

        if (name && (typeof name !== "string" || name.length > MAX_NAME_LENGTH)) {
            return badRequest(`Name must be ${MAX_NAME_LENGTH} characters or fewer`);
        }

        if (message && (typeof message !== "string" || message.length > MAX_MESSAGE_LENGTH)) {
            return badRequest(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer`);
        }

        if (leadType && !ALLOWED_LEAD_TYPES.has(leadType)) {
            return badRequest("Invalid lead type");
        }

        const supabase = await createUntypedClient();

        // Insert lead
        const { error } = await supabase.from("profile_leads").insert({
            profile_id: profileId,
            name: name || null,
            email,
            message: message || null,
            lead_type: leadType || "contact",
            status: "new",
            source_url: request.headers.get("referer") || null,
            referrer: request.headers.get("referer") || null,
        });

        if (error) {
            captureError(error, "api.public.submit_lead.insert_failed", { profileId });
            return serverError("Failed to submit");
        }

        return apiSuccess(null);
    } catch (error) {
        captureError(error, "api.public.submit_lead.unhandled_error");
        return serverError();
    }
}
