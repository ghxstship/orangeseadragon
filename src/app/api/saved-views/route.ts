import { NextRequest } from "next/server";
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, apiCreated, badRequest, supabaseError, serverError } from "@/lib/api/response";
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const searchParams = request.nextUrl.searchParams;
  const entityType = searchParams.get("entity_type");

  let query = supabase
    .from("saved_views")
    .select("*")
    .is("deleted_at", null)
    .or(`user_id.eq.${user.id},is_shared.eq.true`)
    .order("name", { ascending: true });

  if (entityType) {
    query = query.eq("entity_type", entityType);
  }

  const { data, error } = await query;

  if (error) {
    return supabaseError(error);
  }

  return apiSuccess(data);
}

export async function POST(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  try {
    const body = await request.json();
    const {
      name,
      entity_type,
      view_type,
      config,
      filters,
      columns,
      sorting,
      grouping,
      is_shared,
      is_default,
    } = body;

    if (!name || !entity_type || !view_type) {
      return badRequest('name, entity_type, and view_type are required');
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from("users")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      return badRequest('User organization not found');
    }

    // If setting as default, unset other defaults for this entity type
    if (is_default) {
      await supabase
        .from("saved_views")
        .update({ is_default: false })
        .eq("entity_type", entity_type)
        .eq("user_id", user.id)
        .eq("is_default", true);
    }

    const { data, error } = await supabase
      .from("saved_views")
      .insert({
        name,
        entity_type,
        view_type,
        config: config || {},
        filters: filters || null,
        columns: columns || null,
        sorting: sorting || null,
        grouping: grouping || null,
        is_shared: is_shared || false,
        is_default: is_default || false,
        user_id: user.id,
        organization_id: profile.organization_id,
      })
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiCreated(data);
  } catch (error) {
    captureError(error, 'api.saved-views.error');
    return serverError('Failed to create saved view');
  }
}
