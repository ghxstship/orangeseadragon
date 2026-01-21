"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { announcementsPageConfig } from "@/config/pages/announcements";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  published_at: string;
  expires_at?: string;
  priority: "high" | "normal" | "low";
  pinned: boolean;
  views: number;
  audience: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const response = await fetch("/api/v1/announcements");
        if (response.ok) {
          const result = await response.json();
          setAnnouncements(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  const stats = React.useMemo(() => {
    const pinnedCount = announcements.filter((a) => a.pinned).length;
    const highPriorityCount = announcements.filter((a) => a.priority === "high").length;
    const totalViews = announcements.reduce((acc, a) => acc + (a.views || 0), 0);

    return [
      { id: "total", label: "Total", value: announcements.length },
      { id: "pinned", label: "Pinned", value: pinnedCount },
      { id: "highPriority", label: "High Priority", value: highPriorityCount },
      { id: "views", label: "Total Views", value: totalViews },
    ];
  }, [announcements]);

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
    <DataViewPage<Announcement>
      config={announcementsPageConfig}
      data={announcements}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["title", "content", "author"]}
      onAction={handleAction}
    />
  );
}
