import { createUntypedClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { apiSuccess, badRequest, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
    try {
        const { profileId, referrer, userAgent } = await request.json();

        if (!profileId) {
            return badRequest("Profile ID required");
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
            console.error("Error logging profile view:", error);
            // Don't fail the request - analytics should be non-blocking
        }

        return apiSuccess(null);
    } catch (error) {
        console.error("Track view error:", error);
        return serverError();
    }
}
