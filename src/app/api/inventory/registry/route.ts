import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/guard";
import { apiSuccess, supabaseError } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;
  const { supabase } = auth;

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const itemType = searchParams.get("itemType");
  const status = searchParams.get("status");
  const condition = searchParams.get("condition");
  const categoryId = searchParams.get("categoryId");
  const locationId = searchParams.get("locationId");
  const currentHolderId = searchParams.get("currentHolderId");
  const needsMaintenance = searchParams.get("needsMaintenance");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // Build query
  let query = supabase
    .from("inventory_registry")
    .select("*", { count: "exact" })
    .order("name", { ascending: true });

  // Apply filters
  if (itemType) {
    query = query.eq("item_type", itemType);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (condition) {
    query = query.eq("condition", condition);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (locationId) {
    query = query.eq("location_id", locationId);
  }

  if (currentHolderId) {
    query = query.eq("current_holder_id", currentHolderId);
  }

  if (needsMaintenance === "true") {
    const today = new Date().toISOString().split("T")[0];
    query = query.lte("next_maintenance_date", today);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,sku.ilike.%${search}%,serial_number.ilike.%${search}%`
    );
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching inventory registry:", error);
    return supabaseError(error);
  }

  // Calculate totals
  const totals = (data || []).reduce(
    (acc, item) => {
      acc.totalItems += 1;
      acc.totalQuantity += item.quantity || 1;
      acc.totalValue += parseFloat(String(item.total_value ?? 0)) || 0;
      return acc;
    },
    { totalItems: 0, totalQuantity: 0, totalValue: 0 }
  );

  // Transform response
  const items = (data || []).map((item) => ({
    id: item.id,
    itemType: item.item_type,
    entityType: item.entity_type,
    entityId: item.entity_id,
    name: item.name,
    description: item.description,
    sku: item.sku,
    serialNumber: item.serial_number,
    barcode: item.barcode,
    categoryId: item.category_id,
    categoryName: item.category_name,
    status: item.status,
    condition: item.condition,
    locationId: item.location_id,
    locationName: item.location_name,
    currentHolderId: item.current_holder_id,
    currentHolderName: item.current_holder_name,
    quantity: item.quantity,
    unitValue: item.unit_value,
    totalValue: item.total_value,
    currency: item.currency,
    lastMaintenanceDate: item.last_maintenance_date,
    nextMaintenanceDate: item.next_maintenance_date,
    projectId: item.project_id,
    eventId: item.event_id,
    visibility: item.visibility,
    imageUrl: item.image_url,
    specifications: item.specifications,
    metadata: item.metadata,
    createdAt: item.created_at,
  }));

  return apiSuccess({
    items,
    totals,
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    },
  });
}
