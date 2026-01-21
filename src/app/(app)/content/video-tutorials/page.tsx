"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { videoTutorialsPageConfig } from "@/config/pages/video-tutorials";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  thumbnail?: string;
  progress?: number;
  completed?: boolean;
  level: "beginner" | "intermediate" | "advanced";
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function VideoTutorialsPage() {
  const [tutorialsData, setTutorialsData] = React.useState<Tutorial[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTutorials() {
      try {
        const response = await fetch("/api/v1/video-tutorials");
        if (response.ok) {
          const result = await response.json();
          setTutorialsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch tutorials:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTutorials();
  }, []);

  const stats = React.useMemo(() => {
    const completed = tutorialsData.filter((t) => t.completed).length;
    const inProgress = tutorialsData.filter((t) => t.progress && t.progress > 0 && !t.completed).length;
    const totalDuration = tutorialsData.reduce((acc, t) => acc + (t.duration || 0), 0);
    return [
      { id: "total", label: "Total Tutorials", value: tutorialsData.length },
      { id: "completed", label: "Completed", value: completed },
      { id: "inProgress", label: "In Progress", value: inProgress },
      { id: "duration", label: "Total Duration", value: formatDuration(totalDuration) },
    ];
  }, [tutorialsData]);

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
    <DataViewPage<Tutorial>
      config={videoTutorialsPageConfig}
      data={tutorialsData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["title", "description", "category"]}
      onAction={handleAction}
    />
  );
}
