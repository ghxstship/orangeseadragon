import { createUntypedClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { apiSuccess, badRequest, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
    try {
        const { profileId, name, email, message, leadType } = await request.json();

        if (!profileId || !email) {
            return badRequest("Profile ID and email are required");
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return badRequest("Invalid email format");
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
            console.error("Error inserting lead:", error);
            return serverError("Failed to submit");
        }

        return apiSuccess(null);
    } catch (error) {
        console.error("Submit lead error:", error);
        return serverError();
    }
}
