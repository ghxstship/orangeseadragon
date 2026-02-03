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
  const transactionType = searchParams.get("transactionType");
  const direction = searchParams.get("direction");
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");
  const eventId = searchParams.get("eventId");
  const companyId = searchParams.get("companyId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const overdue = searchParams.get("overdue");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  // Build query
  let query = supabase
    .from("financial_ledger")
    .select("*", { count: "exact" })
    .order("transaction_date", { ascending: false });

  // Apply filters
  if (transactionType) {
    query = query.eq("transaction_type", transactionType);
  }

  if (direction) {
    query = query.eq("direction", direction);
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

  if (startDate) {
    query = query.gte("transaction_date", startDate);
  }

  if (endDate) {
    query = query.lte("transaction_date", endDate);
  }

  if (overdue === "true") {
    const today = new Date().toISOString().split("T")[0];
    query = query
      .lt("due_date", today)
      .is("paid_date", null)
      .not("status", "in", '("paid","cancelled")');
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching financial ledger:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial data" },
      { status: 500 }
    );
  }

  // Calculate totals
  const totals = (data || []).reduce(
    (acc, item) => {
      const amount = parseFloat(String(item.amount)) || 0;
      if (item.direction === "inflow") {
        acc.totalInflow += amount;
      } else {
        acc.totalOutflow += amount;
      }
      return acc;
    },
    { totalInflow: 0, totalOutflow: 0 }
  );

  // Transform response
  const items = (data || []).map((txn) => ({
    id: txn.id,
    transactionType: txn.transaction_type,
    direction: txn.direction,
    entityType: txn.entity_type,
    entityId: txn.entity_id,
    referenceNumber: txn.reference_number,
    amount: txn.amount,
    currency: txn.currency,
    amountBase: txn.amount_base,
    status: txn.status,
    counterpartyType: txn.counterparty_type,
    counterpartyId: txn.counterparty_id,
    counterpartyName: txn.counterparty_name,
    projectId: txn.project_id,
    eventId: txn.event_id,
    companyId: txn.company_id,
    transactionDate: txn.transaction_date,
    dueDate: txn.due_date,
    paidDate: txn.paid_date,
    description: txn.description,
    notes: txn.notes,
    metadata: txn.metadata,
    createdAt: txn.created_at,
  }));

  return NextResponse.json({
    items,
    totals: {
      inflow: totals.totalInflow,
      outflow: totals.totalOutflow,
      net: totals.totalInflow - totals.totalOutflow,
    },
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    },
  });
}
