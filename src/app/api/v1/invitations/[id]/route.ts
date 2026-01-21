// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/v1/invitations/[id]
 * Get a specific invitation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from("organization_invitations")
      .select(
        `
        *,
        organization:organizations(id, name, slug, logo_url),
        role:roles(id, name, slug),
        inviter:users!organization_invitations_invited_by_fkey(id, full_name, avatar_url)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/invitations/[id]
 * Update an invitation (resend, revoke)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    // Get the invitation
    const { data: invitation, error: fetchError } = await supabase
      .from("organization_invitations")
      .select("*, organization_id")
      .eq("id", id)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check permission
    const { data: membership } = await supabase
      .from("organization_members")
      .select("is_owner, role:roles(permissions)")
      .eq("organization_id", invitation.organization_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const permissions = (membership.role as { permissions?: Record<string, boolean> } | null)?.permissions || {};
    const canManage =
      membership.is_owner ||
      permissions["*"] === true ||
      permissions["team.invite"] === true;

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "resend":
        // Extend expiration and increment reminder count
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + 7);
        updateData = {
          expires_at: newExpiry.toISOString(),
          reminder_sent_at: new Date().toISOString(),
          reminder_count: (invitation.reminder_count || 0) + 1,
        };
        break;

      case "revoke":
        updateData = {
          revoked_at: new Date().toISOString(),
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'resend' or 'revoke'" },
          { status: 400 }
        );
    }

    const { data, error } = await supabase
      .from("organization_invitations")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        organization:organizations(id, name, slug),
        role:roles(id, name, slug)
      `
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/invitations/[id]
 * Delete an invitation (same as revoke)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the invitation
    const { data: invitation, error: fetchError } = await supabase
      .from("organization_invitations")
      .select("organization_id")
      .eq("id", id)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check permission
    const { data: membership } = await supabase
      .from("organization_members")
      .select("is_owner, role:roles(permissions)")
      .eq("organization_id", invitation.organization_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const permissions = (membership.role as { permissions?: Record<string, boolean> } | null)?.permissions || {};
    const canManage =
      membership.is_owner ||
      permissions["*"] === true ||
      permissions["team.invite"] === true;

    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete by revoking
    const { error } = await supabase
      .from("organization_invitations")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
