// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

/**
 * GET /api/v1/invitations
 * List invitations for the current user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organization_id");
    const status = searchParams.get("status"); // pending, accepted, expired
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("organization_invitations")
      .select(
        `
        *,
        organization:organizations(id, name, slug),
        role:roles(id, name, slug),
        inviter:users!organization_invitations_invited_by_fkey(id, full_name, avatar_url)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    // Filter by status
    if (status === "pending") {
      query = query
        .is("accepted_at", null)
        .is("declined_at", null)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString());
    } else if (status === "accepted") {
      query = query.not("accepted_at", "is", null);
    } else if (status === "expired") {
      query = query
        .is("accepted_at", null)
        .is("declined_at", null)
        .is("revoked_at", null)
        .lt("expires_at", new Date().toISOString());
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/invitations
 * Create a new invitation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      organization_id,
      email,
      role_id,
      department_id,
      position_id,
      account_type_slug,
      message,
      expires_in_days = 7,
    } = body;

    // Validate required fields
    if (!organization_id || !email || !role_id) {
      return NextResponse.json(
        { error: "organization_id, email, and role_id are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user has permission to invite
    const { data: membership } = await supabase
      .from("organization_members")
      .select(
        `
        is_owner,
        role:roles(permissions)
      `
      )
      .eq("organization_id", organization_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this organization" },
        { status: 403 }
      );
    }

    const permissions = (membership.role as { permissions?: Record<string, boolean> } | null)?.permissions || {};
    const canInvite =
      membership.is_owner ||
      permissions["*"] === true ||
      permissions["team.invite"] === true;

    if (!canInvite) {
      return NextResponse.json(
        { error: "You do not have permission to invite members" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("organization_members")
      .select("id")
      .eq("organization_id", organization_id)
      .eq("user_id", (
        await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single()
      ).data?.id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: "This user is already a member of the organization" },
        { status: 400 }
      );
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from("organization_invitations")
      .select("id")
      .eq("organization_id", organization_id)
      .eq("email", email)
      .is("accepted_at", null)
      .is("declined_at", null)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expires_in_days);

    // Create invitation
    const { data: invitation, error } = await supabase
      .from("organization_invitations")
      .insert({
        organization_id,
        email: email.toLowerCase(),
        role_id,
        department_id,
        position_id,
        account_type_slug: account_type_slug || "member",
        invited_by: user.id,
        token,
        message,
        expires_at: expiresAt.toISOString(),
      })
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

    // TODO: Send invitation email via Supabase Edge Function or external service
    // For now, return the invitation with the token for manual sharing

    return NextResponse.json(
      {
        data: invitation,
        invite_url: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
