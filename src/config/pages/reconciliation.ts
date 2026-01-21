import type { PageConfig } from "./types";

export const reconciliationPageConfig: PageConfig = {
  id: "reconciliation",
  title: "Reconciliation",
  description: "Match bank transactions with system records",
  source: { entity: "reconciliation", defaultSorts: [{ field: "date", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Transactions", field: "count" },
      { id: "matched", label: "Matched", field: "matchedCount" },
      { id: "unmatched", label: "Unmatched", field: "unmatchedCount" },
      { id: "partial", label: "Partial / Disputed", field: "partialCount" },
      { id: "amount", label: "Unmatched Amount", field: "unmatchedAmount", format: "currency" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search transactions...", fields: ["transactionId", "description", "bankReference"] },
    filters: { enabled: true, fields: [
      { field: "status", label: "Status", type: "select", options: [{ label: "Matched", value: "matched" }, { label: "Unmatched", value: "unmatched" }, { label: "Partial", value: "partial" }, { label: "Disputed", value: "disputed" }] },
      { field: "source", label: "Source", type: "select", options: [{ label: "Bank", value: "bank" }, { label: "System", value: "system" }] },
    ] },
    columns: { enabled: false },
    viewTypes: ["table"],
  },
  views: {
    table: {
      columns: [
        { field: "transactionId", label: "Transaction ID", sortable: true },
        { field: "bankReference", label: "Bank Ref", sortable: true },
        { field: "description", label: "Description", sortable: false },
        { field: "amount", label: "Amount", sortable: true, align: "right", format: { type: "currency" } },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { matched: "#22c55e", unmatched: "#ef4444", partial: "#eab308", disputed: "#f97316" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "auto-match", label: "Auto-Match", icon: "link" },
  rowActions: [{ id: "view", label: "View Details" }, { id: "match", label: "Find Match" }, { id: "unmatch", label: "Unmatch" }, { id: "adjust", label: "Adjust Amount" }, { id: "resolve", label: "Resolve Dispute" }],
};
