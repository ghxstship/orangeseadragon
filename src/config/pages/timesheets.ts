import type { PageConfig } from "./types";

export const timesheetsPageConfig: PageConfig = {
  id: "timesheets",
  title: "Timesheets",
  description: "Track and approve employee time entries",
  source: { entity: "timesheets", defaultSorts: [{ field: "weekStarting", direction: "desc" }] },
  stats: {
    enabled: true,
    items: [
      { id: "hours", label: "Total Hours", field: "totalHours" },
      { id: "overtime", label: "Overtime Hours", field: "overtimeHours" },
      { id: "pending", label: "Pending Approval", field: "pendingCount" },
      { id: "approved", label: "Approved", field: "approvedCount" },
    ],
  },
  toolbar: {
    search: { enabled: true, placeholder: "Search timesheets...", fields: ["employeeName", "employeeId"] },
    filters: { enabled: true, fields: [{ field: "status", label: "Status", type: "select", options: [{ label: "Draft", value: "draft" }, { label: "Submitted", value: "submitted" }, { label: "Approved", value: "approved" }, { label: "Rejected", value: "rejected" }, { label: "Paid", value: "paid" }] }] },
    columns: { enabled: false },
    viewTypes: ["table", "list"],
  },
  views: {
    table: {
      columns: [
        { field: "employeeName", label: "Employee", sortable: true },
        { field: "weekStarting", label: "Week", sortable: true, format: { type: "date" } },
        { field: "totalHours", label: "Total Hours", sortable: true, align: "right" },
        { field: "overtimeHours", label: "OT Hours", sortable: true, align: "right" },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", submitted: "#3b82f6", approved: "#22c55e", rejected: "#ef4444", paid: "#a855f7" } } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },
  primaryAction: { id: "create", label: "New Timesheet", icon: "plus" },
  rowActions: [{ id: "view", label: "View Details" }, { id: "edit", label: "Edit" }, { id: "approve", label: "Approve" }, { id: "reject", label: "Reject" }, { id: "export", label: "Export" }],
};
