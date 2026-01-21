"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { featureRequestsPageConfig } from "@/config/pages/feature-requests";

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: "submitted" | "under_review" | "planned" | "in_progress" | "completed" | "declined";
  votes: number;
  comments: number;
  submitted_by: string;
  submitted_at: string;
  category: string;
}

export default function FeatureRequestsPage() {
  const [featureRequestsData, setFeatureRequestsData] = React.useState<FeatureRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchFeatureRequests() {
      try {
        const response = await fetch("/api/v1/feature-requests");
        if (response.ok) {
          const result = await response.json();
          setFeatureRequestsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch feature requests:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatureRequests();
  }, []);

  const stats = React.useMemo(() => {
    const completedRequests = featureRequestsData.filter((r) => r.status === "completed").length;
    const inProgressRequests = featureRequestsData.filter((r) => r.status === "in_progress" || r.status === "planned").length;
    const totalVotes = featureRequestsData.reduce((acc, r) => acc + (r.votes || 0), 0);

    return [
      { id: "total", label: "Total Requests", value: featureRequestsData.length },
      { id: "inProgress", label: "In Progress", value: inProgressRequests },
      { id: "completed", label: "Completed", value: completedRequests },
      { id: "votes", label: "Total Votes", value: totalVotes },
    ];
  }, [featureRequestsData]);

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
    <DataViewPage<FeatureRequest>
      config={featureRequestsPageConfig}
      data={featureRequestsData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["title", "description", "category"]}
      onAction={handleAction}
    />
  );
}
