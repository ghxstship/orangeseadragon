import type { PageConfig } from "./types";

export const documentsPageConfig: PageConfig = {
  id: "documents",
  title: "Documents",
  description: "Create and manage documents, wikis, and templates",

  source: {
    entity: "documents",
    defaultSorts: [{ field: "updatedAt", direction: "desc" }],
  },

  stats: {
    enabled: true,
    items: [
      { id: "total", label: "Total Documents", field: "count" },
      { id: "published", label: "Published", field: "publishedCount" },
      { id: "drafts", label: "Drafts", field: "draftCount" },
      { id: "starred", label: "Starred", field: "starredCount" },
    ],
  },

  toolbar: {
    search: {
      enabled: true,
      placeholder: "Search documents...",
      fields: ["title", "folder", "createdBy"],
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
            { label: "Published", value: "published" },
            { label: "Archived", value: "archived" },
          ],
        },
        {
          field: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Document", value: "document" },
            { label: "Template", value: "template" },
            { label: "Wiki", value: "wiki" },
            { label: "Note", value: "note" },
          ],
        },
      ],
    },
    columns: { enabled: false },
    viewTypes: ["table", "grid"],
  },

  views: {
    table: {
      columns: [
        { field: "title", label: "Title", sortable: true },
        { field: "type", label: "Type", sortable: true, format: { type: "badge" } },
        { field: "status", label: "Status", sortable: true, format: { type: "badge", colorMap: { draft: "#eab308", published: "#22c55e", archived: "#6b7280" } } },
        { field: "folder", label: "Folder", sortable: true },
        { field: "createdBy", label: "Created By", sortable: true },
        { field: "updatedAt", label: "Updated", sortable: true },
        { field: "sharedWith", label: "Shared", sortable: true, align: "right" },
      ],
      defaultPageSize: 10,
      selectable: true,
    },
  },

  primaryAction: { id: "create", label: "New Document", icon: "plus" },
  rowActions: [
    { id: "open", label: "Open" },
    { id: "edit", label: "Edit" },
    { id: "share", label: "Share" },
    { id: "duplicate", label: "Duplicate" },
    { id: "move", label: "Move" },
    { id: "delete", label: "Delete", variant: "destructive" },
  ],
};
