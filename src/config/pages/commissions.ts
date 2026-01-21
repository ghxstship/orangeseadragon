import type { PageConfig } from "./types";

export const commissionsPageConfig: PageConfig = {
  id: "commissions",
  title: "Commissions",
  description: "Track sales commissions and payouts",
  source: { entity: "commissions", defaultSorts: [{ field: "period", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Commissions", field: "totalCommissions", format: "currency" },
      { id: "pending", label: "Pending Payout", field: "pendingAmount", format: "currency" },
      { id: "paid", label: "Paid Out", field: "paidAmount", format: "currency" },
      { id: "sales", label: "Total Sales", field: "totalSales", format: "currency" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search commissions...", fields: ["salesPerson", "period"] },
    filters: { enabled: true, fields: [{ field: "status", label: "Status", type: "select", options: [{ label: "Pending", value: "pending" }, { label: "Approved", value: "approved" }, { label: "Paid", value: "paid" }] }] },
    columns: { enabled: false },
    viewTypes: ["table"],
  },
  views: {
    table: {
      columns: [
        { field: "salesPerson", label: "Sales Person", sortable: true },
        { field: "period", label: "Period", sortable: true },
        { field: "salesAmount", label: "Sales", sortable: true, align: "right", format: { type: "currency" } },
        { field: "commissionRate", label: "Rate", sortable: true, align: "right" },
        { field: "commissionEarned", label: "Commission", sortable: true, align: "right", format: { type: "currency" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { pending: "#eab308", approved: "#3b82f6", paid: "#22c55e" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "payout", label: "Process Payouts", icon: "dollar" },
  rowActions: [{ id: "view", label: "View Details" }, { id: "deals", label: "View Deals" }, { id: "approve", label: "Approve" }, { id: "pay", label: "Mark as Paid" }, { id: "adjust", label: "Adjust Commission" }],
};
