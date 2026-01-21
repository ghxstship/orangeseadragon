import type { PageConfig } from "./types";

export const jobsActivePageConfig: PageConfig = {
  id: "jobs-active",
  title: "Active Jobs",
  description: "Open positions",

  source: {
    entity: "jobsActive",
    defaultSorts: [{ field: "posted_at", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Open Positions", field: "totalCount" },
      { id: "applicants", label: "Total Applicants", field: "totalApplicants" },
      { id: "avg", label: "Avg per Position", field: "avgApplicants" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search jobs...",
      fields: ["title", "department", "location"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Full-time", value: "full-time" },
            { label: "Part-time", value: "part-time" },
            { label: "Contract", value: "contract" },
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
        { field: "department", label: "Department", sortable: true },
        { field: "location", label: "Location", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "applicants", label: "Applicants", sortable: true },
        { field: "posted_at", label: "Posted", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "post-job", label: "Post Job", icon: "plus" },
  rowActions: [
    { id: "view-applicants", label: "View Applicants" },
    { id: "edit", label: "Edit" },
    { id: "close", label: "Close Position" },
  ],
};
