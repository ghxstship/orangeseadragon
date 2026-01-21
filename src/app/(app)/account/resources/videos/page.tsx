"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { videosPageConfig } from "@/config/pages/videos";

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  views: number;
}

export default function AccountResourcesVideosPage() {
  const [videosData, setVideosData] = React.useState<VideoItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch("/api/v1/account/resources/videos");
        if (response.ok) {
          const result = await response.json();
          setVideosData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const stats = React.useMemo(() => {
    const totalViews = videosData.reduce((acc, v) => acc + (v.views || 0), 0);
    return [
      { id: "total", label: "Total Videos", value: videosData.length },
      { id: "views", label: "Total Views", value: totalViews },
      { id: "duration", label: "Avg Duration", value: "6:50" },
    ];
  }, [videosData]);

  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Action:", actionId, payload);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<VideoItem>
      config={videosPageConfig}
      data={videosData}
      stats={stats}
      getRowId={(v) => v.id}
      searchFields={["title"]}
      onAction={handleAction}
    />
  );
}
