import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/guard";
import { apiSuccess, apiNoContent, badRequest, notFound, supabaseError, serverError } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { id } = await params;

  const { data, error } = await supabase
    .from("dashboard_layouts")
    .select("*")
    .eq("id", id)
    .or(`user_id.eq.${user.id},is_shared.eq.true`)
    .single();

  if (error) {
    return notFound('Dashboard layout');
  }

  return apiSuccess(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { id } = await params;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    const allowedFields = [
      "name",
      "description",
      "widgets",
      "columns",
      "is_shared",
      "is_default",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return badRequest('No valid fields to update');
    }

    // If setting as default, unset other defaults
    if (updates.is_default === true) {
      await supabase
        .from("dashboard_layouts")
        .update({ is_default: false })
        .eq("user_id", user.id)
        .eq("is_default", true)
        .neq("id", id);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("dashboard_layouts")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return supabaseError(error);
    }

    return apiSuccess(data);
  } catch (error) {
    console.error("Failed to update dashboard layout:", error);
    return serverError('Failed to update dashboard layout');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  const { id } = await params;

  const { error } = await supabase
    .from("dashboard_layouts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return supabaseError(error);
  }

  return apiNoContent();
}
