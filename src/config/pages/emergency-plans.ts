import type { PageConfig } from "./types";

export const emergencyPlansPageConfig: PageConfig = {
  id: "emergency-plans",
  title: "Emergency Plans",
  description: "Manage emergency response documentation",

  source: {
    entity: "emergencyPlans",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Plans", field: "totalPlans" },
      { id: "active", label: "Active", field: "activePlans" },
      { id: "drafts", label: "Drafts", field: "draftPlans" },
      { id: "contacts", label: "Emergency Contacts", field: "totalContacts" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search plans...",
      fields: ["name", "eventName"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Evacuation", value: "evacuation" },
            { label: "Medical", value: "medical" },
            { label: "Weather", value: "weather" },
            { label: "Security", value: "security" },
            { label: "Fire", value: "fire" },
            { label: "General", value: "general" },
          ],
        },
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Approved", value: "approved" },
            { label: "Active", value: "active" },
            { label: "Archived", value: "archived" },
          ],
        },
      ],
    },
    columns: { enabled: true },
    viewTypes: ["list", "grid", "table"],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Plan Name", sortable: true },
        { field: "eventName", label: "Event", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", approved: "#3b82f6", active: "#22c55e", archived: "#9ca3af" } } },
        { field: "version", label: "Version", sortable: true },
        { field: "lastUpdated", label: "Last Updated", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "Create Plan", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Plan" },
    { id: "edit", label: "Edit Plan" },
    { id: "download", label: "Download PDF" },
    { id: "history", label: "View History" },
    { id: "submit", label: "Submit for Approval" },
    { id: "activate", label: "Activate Plan" },
    { id: "archive", label: "Archive", variant: "destructive" },
  ],
};
