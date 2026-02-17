import { NextRequest } from "next/server";
import { requirePolicy } from '@/lib/api/guard';
import { apiSuccess, supabaseError } from "@/lib/api/response";
import { captureError } from '@/lib/observability';

export async function GET(request: NextRequest) {
  const auth = await requirePolicy('entity.read');
  if (auth.error) return auth.error;
  const { supabase } = auth;

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
    captureError(error, 'api.people.directory.error');
    return supabaseError(error);
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

  return apiSuccess({
    items,
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    },
  });
}
