import type { PageConfig } from "./types";

export const contentApprovalsPageConfig: PageConfig = {
  id: "content-approvals",
  title: "Content Approvals",
  description: "Review and approve content",

  source: {
    entity: "contentApprovals",
    defaultSorts: [{ field: "submitted_at", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total", field: "totalCount" },
      { id: "pending", label: "Pending", field: "pendingCount" },
      { id: "approved", label: "Approved", field: "approvedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search approvals...",
      fields: ["title", "submitted_by"],
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
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Article", value: "article" },
            { label: "Page", value: "page" },
            { label: "Media", value: "media" },
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
        { field: "title", label: "Title", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "submitted_by", label: "Submitted By", sortable: true },
        { field: "submitted_at", label: "Submitted", sortable: true, format: { type: "date" } },
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

  rowActions: [
    { id: "approve", label: "Approve" },
    { id: "reject", label: "Reject" },
    { id: "preview", label: "Preview" },
    { id: "request-changes", label: "Request Changes" },
  ],
};
