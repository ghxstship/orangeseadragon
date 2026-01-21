import type { PageConfig } from "./types";

export const procurementRequisitionsPageConfig: PageConfig = {
  id: "procurement-requisitions",
  title: "Requisitions",
  description: "Purchase requisitions",

  source: {
    entity: "procurementRequisitions",
    defaultSorts: [{ field: "date", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Requisitions", field: "totalCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
      { id: "approved", label: "Approved", field: "approvedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search requisitions...",
      fields: ["id", "title", "requested_by"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
          ],
        },
      ],
    },
    columns: { enabled: true },
    viewTypes: ["list", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "id", label: "Req ID", sortable: true },
        { field: "title", label: "Title", sortable: true },
        { field: "requested_by", label: "Requested By", sortable: true },
        { field: "amount", label: "Amount", sortable: true },
        { field: "date", label: "Date", sortable: true, format: { type: "date" } },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              pending: "#eab308",
              approved: "#22c55e",
              rejected: "#ef4444",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "new-requisition", label: "New Requisition", icon: "plus" },
  rowActions: [
    { id: "view", label: "View" },
    { id: "approve", label: "Approve" },
    { id: "reject", label: "Reject" },
  ],
};
