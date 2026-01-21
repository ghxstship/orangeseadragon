// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const organizationId = searchParams.get("organization_id");
    const offset = (page - 1) * limit;

    let query = supabase
      .from("events")
      .select("*, venue:venues(id, name)", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("start_date", { ascending: false });

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }
    if (status) {
      query = query.eq("status", status as any);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.organization_id || !body.name || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { error: "Missing required fields: organization_id, name, start_date, end_date" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("events")
      .insert({
        organization_id: body.organization_id,
        name: body.name,
        description: body.description,
        event_type: body.event_type || "general",
        status: body.status || "draft",
        start_date: body.start_date,
        end_date: body.end_date,
        venue_id: body.venue_id,
        capacity: body.capacity,
        budget: body.budget,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
