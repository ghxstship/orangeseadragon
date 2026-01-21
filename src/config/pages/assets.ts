import type { PageConfig } from "./types";

export const assetsPageConfig: PageConfig = {
  id: "assets",
  title: "Assets",
  description: "Manage equipment and inventory",

  source: {
    entity: "assets",
    defaultSorts: [{ field: "name", direction: "asc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Assets", field: "count" },
      { id: "available", label: "Available", field: "availableCount" },
      { id: "inUse", label: "In Use / Maintenance", field: "inUseCount" },
      { id: "value", label: "Total Value", field: "totalValue", format: "currency" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search assets...",
      fields: ["name", "assetTag", "category"],
    },
    filters: {
      enabled: true,
      fields: [
        {
          field: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Available", value: "available" },
            { label: "In Use", value: "in_use" },
            { label: "Maintenance", value: "maintenance" },
            { label: "Reserved", value: "reserved" },
            { label: "Retired", value: "retired" },
            { label: "Lost", value: "lost" },
            { label: "Damaged", value: "damaged" },
          ],
        },
        {
          field: "condition",
          label: "Condition",
          type: "select",
          options: [
            { label: "Excellent", value: "excellent" },
            { label: "Good", value: "good" },
            { label: "Fair", value: "fair" },
            { label: "Poor", value: "poor" },
            { label: "Broken", value: "broken" },
          ],
        },
        {
          field: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "Video", value: "Video" },
            { label: "Lighting", value: "Lighting" },
            { label: "Audio", value: "Audio" },
            { label: "Rigging", value: "Rigging" },
            { label: "Power", value: "Power" },
            { label: "Staging", value: "Staging" },
          ],
        },
      ],
    },
    sort: {
      enabled: true,
      fields: [
        { field: "name", label: "Name" },
        { field: "assetTag", label: "Asset Tag" },
        { field: "category", label: "Category" },
        { field: "status", label: "Status" },
        { field: "currentValue", label: "Value" },
        { field: "location", label: "Location" },
      ],
    },
    columns: { enabled: true },
    viewTypes: ["table", "grid"],
    export: { enabled: true, formats: ["csv", "xlsx"] },
    refresh: { enabled: true },
    bulkActions: [
      { id: "checkout", label: "Check Out" },
      { id: "checkin", label: "Check In" },
      { id: "maintenance", label: "Schedule Maintenance" },
      { id: "retire", label: "Retire", variant: "destructive" },
    ],
  },

  views: {
    table: {
      columns: [
        { field: "name", label: "Asset", sortable: true, width: 250 },
        { field: "assetTag", label: "Tag", sortable: true, visible: false },
        { field: "category", label: "Category", sortable: true, format: { type: "badge" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { available: "#22c55e", in_use: "#3b82f6", maintenance: "#eab308", reserved: "#a855f7", retired: "#6b7280", lost: "#ef4444", damaged: "#f97316" } } },
        { field: "condition", label: "Condition", sortable: true },
        { field: "location", label: "Location", sortable: true },
        { field: "assignedTo", label: "Assigned To", sortable: true },
        { field: "currentValue", label: "Value", sortable: true, align: "right", format: { type: "currency" } },
      ],
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50, 100],
      selectable: true,
    },
    grid: {
      titleField: "name",
      subtitleField: "assetTag",
      badgeField: "status",
      cardFields: ["category", "location", "currentValue"],
      columns: 4,
    },
  },

  primaryAction: {
    id: "create",
    label: "Add Asset",
    icon: "plus",
  },

  rowActions: [
    { id: "view", label: "View Details" },
    { id: "checkout", label: "Check Out" },
    { id: "checkin", label: "Check In" },
    { id: "maintenance", label: "Schedule Maintenance" },
    { id: "qrcode", label: "Print QR Code" },
    { id: "edit", label: "Edit" },
    { id: "retire", label: "Retire Asset", variant: "destructive" },
  ],
};
