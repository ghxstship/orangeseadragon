"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { pipelineActivitiesPageConfig } from "@/config/pages/pipeline-activities";

interface PipelineActivity {
  id: string;
  type: string;
  description: string;
  contact: string;
  time: string;
}

export default function PipelineActivitiesPage() {
  const [activitiesData, setActivitiesData] = React.useState<PipelineActivity[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch("/api/v1/pipeline/activities");
        if (response.ok) {
          const result = await response.json();
          setActivitiesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, []);

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
    <DataViewPage<PipelineActivity>
      config={pipelineActivitiesPageConfig}
      data={activitiesData}
      getRowId={(a) => a.id}
      searchFields={["description", "contact"]}
      onAction={handleAction}
    />
  );
}
