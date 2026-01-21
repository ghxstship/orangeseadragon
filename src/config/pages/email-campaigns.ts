import type { PageConfig } from "./types";

export const emailCampaignsPageConfig: PageConfig = {
  id: "email-campaigns",
  title: "Email Campaigns",
  description: "Create and manage email marketing campaigns",

  source: {
    entity: "emailCampaigns",
    defaultSorts: [{ field: "sentDate", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Campaigns", field: "totalCampaigns" },
      { id: "delivered", label: "Emails Delivered", field: "totalDelivered" },
      { id: "openRate", label: "Avg Open Rate", field: "avgOpenRate" },
      { id: "scheduled", label: "Scheduled", field: "scheduledCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search campaigns...",
      fields: ["name", "subject", "eventName"],
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
            { label: "Scheduled", value: "scheduled" },
            { label: "Sending", value: "sending" },
            { label: "Sent", value: "sent" },
            { label: "Failed", value: "failed" },
          ],
        },
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Announcement", value: "announcement" },
            { label: "Reminder", value: "reminder" },
            { label: "Newsletter", value: "newsletter" },
            { label: "Promotional", value: "promotional" },
            { label: "Follow Up", value: "follow_up" },
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
        { field: "name", label: "Campaign", sortable: true },
        { field: "type", label: "Type", sortable: true },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#6b7280", scheduled: "#3b82f6", sending: "#eab308", sent: "#22c55e", failed: "#ef4444" } } },
        { field: "recipients", label: "Recipients", sortable: true, format: { type: "number" } },
        { field: "delivered", label: "Delivered", sortable: true, format: { type: "number" } },
        { field: "sentDate", label: "Sent", sortable: true, format: { type: "date" } },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "New Campaign", icon: "plus" },
  rowActions: [
    { id: "view", label: "View Details" },
    { id: "edit", label: "Edit Campaign" },
    { id: "duplicate", label: "Duplicate" },
    { id: "schedule", label: "Schedule" },
    { id: "send", label: "Send Now" },
    { id: "report", label: "View Report" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
