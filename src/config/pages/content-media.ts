import type { MediaPageConfig } from "./media-types";

export const contentMediaPageConfig: MediaPageConfig = {
  id: "content-media",
  title: "Media Library",
  description: "Images, videos, and documents",

  views: ["grid", "list"],
  defaultView: "grid",

  item: {
    idField: "id",
    nameField: "name",
    urlField: "url",
    thumbnailField: "thumbnail",
    typeField: "type",
    sizeField: "size",
    createdAtField: "uploadedAt",
  },

  upload: {
    enabled: true,
    accept: ["image/*", "video/*", "application/pdf"],
    maxSize: 50 * 1024 * 1024,
    maxFiles: 10,
    dragDrop: true,
  },

  toolbar: {
    search: { enabled: true, placeholder: "Search media..." },
    filters: [
      {
        field: "type",
        label: "Type",
        options: [
          { label: "Images", value: "image" },
          { label: "Videos", value: "video" },
          { label: "Documents", value: "document" },
        ],
      },
    ],
  },

  actions: {
    download: true,
    delete: true,
    preview: true,
    share: true,
  },

  display: {
    columns: 3,
    showFileInfo: true,
    thumbnailSize: "medium",
  },
};
