import type { PageConfig } from "./types";

export const procurementRfqPageConfig: PageConfig = {
  id: "procurement-rfq",
  title: "RFQ",
  description: "Request for Quotations",

  source: {
    entity: "procurementRfq",
    defaultSorts: [{ field: "deadline", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total RFQs", field: "totalCount" },
      { id: "open", label: "Open", field: "openCount" },
      { id: "closed", label: "Closed", field: "closedCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search RFQs...",
      fields: ["id", "title"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Open", value: "open" },
            { label: "Closed", value: "closed" },
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
        { field: "id", label: "RFQ ID", sortable: true },
        { field: "title", label: "Title", sortable: true },
        { field: "vendors", label: "Vendors", sortable: true },
        { field: "responses", label: "Responses", sortable: true },
        { field: "deadline", label: "Deadline", sortable: true, format: { type: "date" } },
        {
          field: "status",
          label: "Status",
          sortable: true,
          format: {
            type: "badge",
            colorMap: {
              draft: "#6b7280",
              open: "#22c55e",
              closed: "#3b82f6",
            },
          },
        },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create-rfq", label: "Create RFQ", icon: "plus" },
  rowActions: [
    { id: "view", label: "View" },
    { id: "compare", label: "Compare Quotes" },
    { id: "award", label: "Award" },
  ],
};
