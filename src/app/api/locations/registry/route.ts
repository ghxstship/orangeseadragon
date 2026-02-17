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
  const locationType = searchParams.get("locationType");
  const locationCategory = searchParams.get("locationCategory");
  const city = searchParams.get("city");
  const country = searchParams.get("country");
  const isActive = searchParams.get("isActive");
  const isPartner = searchParams.get("isPartner");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // Build query
  let query = supabase
    .from("location_registry")
    .select("*", { count: "exact" })
    .order("name", { ascending: true });

  // Apply filters
  if (locationType) {
    query = query.eq("location_type", locationType);
  }

  if (locationCategory) {
    query = query.eq("location_category", locationCategory);
  }

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  if (country) {
    query = query.eq("country", country);
  }

  if (isActive !== null) {
    query = query.eq("is_active", isActive === "true");
  }

  if (isPartner !== null) {
    query = query.eq("is_partner", isPartner === "true");
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%`
    );
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    captureError(error, 'api.locations.registry.error');
    return supabaseError(error);
  }

  // Transform response
  const items = (data || []).map((location) => ({
    id: location.id,
    locationType: location.location_type,
    locationCategory: location.location_category,
    entityType: location.entity_type,
    entityId: location.entity_id,
    parentId: location.parent_id,
    name: location.name,
    description: location.description,
    address: location.address,
    city: location.city,
    state: location.state,
    country: location.country,
    postalCode: location.postal_code,
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone,
    capacity: location.capacity,
    contactName: location.contact_name,
    contactPhone: location.contact_phone,
    contactEmail: location.contact_email,
    website: location.website,
    isActive: location.is_active,
    isPartner: location.is_partner,
    visibility: location.visibility,
    amenities: location.amenities,
    metadata: location.metadata,
    createdAt: location.created_at,
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
