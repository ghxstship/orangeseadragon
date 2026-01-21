"use client";

import * as React from "react";
import { MediaPage } from "@/components/common";
import { contentMediaPageConfig } from "@/config/pages/content-media";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
  type: string;
  size: number;
  uploadedAt: string;
}

const mediaItems: MediaItem[] = [
  { id: "1", name: "Event Banner.jpg", url: "/media/event-banner.jpg", type: "image/jpeg", size: 2457600, uploadedAt: "2024-06-18" },
  { id: "2", name: "Promo Video.mp4", url: "/media/promo-video.mp4", type: "video/mp4", size: 47185920, uploadedAt: "2024-06-15" },
  { id: "3", name: "Press Release.pdf", url: "/media/press-release.pdf", type: "application/pdf", size: 159744, uploadedAt: "2024-06-10" },
];

export default function ContentMediaPage() {
  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Media action:", actionId, payload);
  }, []);

  const handleItemClick = React.useCallback((item: MediaItem) => {
    console.log("Media item clicked:", item);
  }, []);

  const handleUpload = React.useCallback((files: FileList) => {
    console.log("Files to upload:", files);
  }, []);

  return (
    <MediaPage
      config={contentMediaPageConfig}
      items={mediaItems}
      getItemId={(item) => item.id}
      onAction={handleAction}
      onItemClick={handleItemClick}
      onUpload={handleUpload}
    />
  );
}
