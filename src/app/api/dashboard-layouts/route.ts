import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/guard";
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from "@/lib/api/response";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  // Get user's organization
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  const metadataOrganizationId = (
    user.user_metadata as { organization_id?: string } | null | undefined
  )?.organization_id;
  const organizationId = profile?.organization_id ?? metadataOrganizationId ?? null;

  // Fetch user's layouts and optionally org-shared layouts
  let layoutsQuery = supabase
    .from("dashboard_layouts")
    .select("*")
    .is("deleted_at", null);

  if (organizationId) {
    layoutsQuery = layoutsQuery.or(
      `user_id.eq.${user.id},and(is_shared.eq.true,organization_id.eq.${organizationId})`
    );
  } else {
    if (profileError) {
      console.warn(
        "Dashboard layouts profile lookup failed, falling back to user-only layouts",
        { code: profileError.code }
      );
    }
    layoutsQuery = layoutsQuery.eq("user_id", user.id);
  }

  const { data, error } = await layoutsQuery
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    // Table might not exist yet, return default
    if (error.code === "42P01") {
      return apiSuccess([], { useDefault: true });
    }
    return supabaseError(error);
  }

  return apiSuccess(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {
    const body = await request.json();
    const { name, description, widgets, columns, is_shared, is_default } = body;

    if (!name || !widgets) {
      return badRequest('name and widgets are required');
    }

    // Get user's organization
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    const metadataOrganizationId = (
      user.user_metadata as { organization_id?: string } | null | undefined
    )?.organization_id;
    const organizationId = profile?.organization_id ?? metadataOrganizationId ?? null;

    if (!organizationId) {
      if (profileError) {
        console.warn("Dashboard layout create profile lookup failed", {
          code: profileError.code,
        });
      }
      return badRequest('User organization not found');
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await supabase
        .from("dashboard_layouts")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true);
    }

    const { data, error } = await supabase
      .from("dashboard_layouts")
      .insert({
        name,
        description: description || null,
        widgets,
        columns: columns || 12,
        is_shared: is_shared || false,
        is_default: is_default || false,
        user_id: user.id,
        organization_id: organizationId,
      })
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiCreated(data);
  } catch (error) {
    console.error("Failed to create dashboard layout:", error);
    return serverError('Failed to create dashboard layout');
  }
}
