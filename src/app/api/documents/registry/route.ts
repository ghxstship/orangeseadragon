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
  const documentType = searchParams.get("documentType");
  const documentCategory = searchParams.get("documentCategory");
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");
  const eventId = searchParams.get("eventId");
  const companyId = searchParams.get("companyId");
  const search = searchParams.get("search");
  const expiringBefore = searchParams.get("expiringBefore");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // Build query
  let query = supabase
    .from("document_registry")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false });

  // Apply filters
  if (documentType) {
    query = query.eq("document_type", documentType);
  }

  if (documentCategory) {
    query = query.eq("document_category", documentCategory);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  if (eventId) {
    query = query.eq("event_id", eventId);
  }

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  if (expiringBefore) {
    query = query.lte("expires_at", expiringBefore);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,file_name.ilike.%${search}%`
    );
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching document registry:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }

  // Transform response
  const items = (data || []).map((doc) => ({
    id: doc.id,
    documentType: doc.document_type,
    documentCategory: doc.document_category,
    entityType: doc.entity_type,
    entityId: doc.entity_id,
    title: doc.title,
    description: doc.description,
    fileUrl: doc.file_url,
    fileType: doc.file_type,
    fileSize: doc.file_size,
    fileName: doc.file_name,
    status: doc.status,
    version: doc.version,
    expiresAt: doc.expires_at,
    signedAt: doc.signed_at,
    projectId: doc.project_id,
    eventId: doc.event_id,
    companyId: doc.company_id,
    contactId: doc.contact_id,
    dealId: doc.deal_id,
    visibility: doc.visibility,
    uploadedBy: doc.uploaded_by,
    tags: doc.tags,
    metadata: doc.metadata,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
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
