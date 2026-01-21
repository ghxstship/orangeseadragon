import type { PageConfig } from "./types";

export const taxReportsPageConfig: PageConfig = {
  id: "tax-reports",
  title: "Tax Reports",
  description: "Manage tax filings and compliance",
  source: { entity: "tax_reports", defaultSorts: [{ field: "dueDate", direction: "asc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Reports", field: "count" },
      { id: "filed", label: "Filed", field: "filedCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
      { id: "overdue", label: "Overdue", field: "overdueCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search tax reports...", fields: ["name", "period"] },
    filters: { enabled: true, fields: [
      { field: "status", label: "Status", type: "select", options: [{ label: "Filed", value: "filed" }, { label: "Pending", value: "pending" }, { label: "Overdue", value: "overdue" }, { label: "Draft", value: "draft" }] },
      { field: "type", label: "Type", type: "select", options: [{ label: "Quarterly", value: "quarterly" }, { label: "Annual", value: "annual" }, { label: "Sales Tax", value: "sales_tax" }, { label: "Payroll", value: "payroll" }, { label: "1099", value: "1099" }] },
    ] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "name", label: "Name", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge", colorMap: { quarterly: "#3b82f6", annual: "#a855f7", sales_tax: "#22c55e", payroll: "#f97316", "1099": "#ec4899" } } },
        { field: "period", label: "Period", sortable: true },
        { field: "dueDate", label: "Due Date", sortable: true, format: { type: "date" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { filed: "#22c55e", pending: "#eab308", overdue: "#ef4444", draft: "#6b7280" } } },
        { field: "amount", label: "Amount", sortable: true, align: "right", format: { type: "currency" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "Generate Report", icon: "calculator" },
  rowActions: [{ id: "view", label: "View Report" }, { id: "download", label: "Download PDF" }, { id: "edit", label: "Edit Report" }, { id: "file", label: "Mark as Filed" }, { id: "confirmation", label: "View Filing Confirmation" }],
};
