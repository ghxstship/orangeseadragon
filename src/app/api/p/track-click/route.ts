import { createUntypedClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { apiSuccess, badRequest, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
    try {
        const { linkId } = await request.json();

        if (!linkId) {
            return badRequest("Link ID required");
        }

        const supabase = await createUntypedClient();

        // Call the database function to log click
        const { error } = await supabase.rpc("log_link_click", {
            p_link_id: linkId,
            p_referrer: null,
            p_session_id: null,
        });

        if (error) {
            console.error("Error logging link click:", error);
        }

        return apiSuccess(null);
    } catch (error) {
        console.error("Track click error:", error);
        return serverError();
    }
}
