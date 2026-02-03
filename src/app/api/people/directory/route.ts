import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createServiceClient();

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const personType = searchParams.get("personType");
  const companyId = searchParams.get("companyId");
  const isInternal = searchParams.get("isInternal");
  const isActive = searchParams.get("isActive");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // Build query
  let query = supabase
    .from("people_directory")
    .select("*", { count: "exact" })
    .order("full_name", { ascending: true });

  // Apply filters
  if (personType) {
    query = query.eq("person_type", personType);
  }

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  if (isInternal !== null) {
    query = query.eq("is_internal", isInternal === "true");
  }

  if (isActive !== null) {
    query = query.eq("is_active", isActive === "true");
  }

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%,job_title.ilike.%${search}%`
    );
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching people directory:", error);
    return NextResponse.json(
      { error: "Failed to fetch people" },
      { status: 500 }
    );
  }

  // Transform response
  const items = (data || []).map((person) => ({
    id: person.id,
    personType: person.person_type,
    entityType: person.entity_type,
    entityId: person.entity_id,
    firstName: person.first_name,
    lastName: person.last_name,
    fullName: person.full_name,
    displayName: person.display_name,
    email: person.email,
    phone: person.phone,
    mobile: person.mobile,
    jobTitle: person.job_title,
    department: person.department,
    companyId: person.company_id,
    companyName: person.company_name,
    avatarUrl: person.avatar_url,
    bio: person.bio,
    linkedinUrl: person.linkedin_url,
    twitterHandle: person.twitter_handle,
    websiteUrl: person.website_url,
    isInternal: person.is_internal,
    isActive: person.is_active,
    tags: person.tags,
    visibility: person.visibility,
    metadata: person.metadata,
    createdAt: person.created_at,
  }));

  return NextResponse.json({
    items,
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    },
  });
}
