"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { businessContinuityPageConfig } from "@/config/pages/business-continuity";

interface BCPlan {
  id: string;
  name: string;
  category: string;
  status: "current" | "review_needed" | "outdated";
  last_reviewed: string;
  next_review: string;
  owner: string;
}

export default function BusinessContinuityPage() {
  const [businessContinuityData, setBusinessContinuityData] = React.useState<BCPlan[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch("/api/v1/business-continuity");
        if (response.ok) {
          const result = await response.json();
          setBusinessContinuityData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch business continuity plans:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const stats = React.useMemo(() => {
    const currentPlans = businessContinuityData.filter((p) => p.status === "current").length;
    const reviewNeeded = businessContinuityData.filter((p) => p.status === "review_needed").length;
    const overallReadiness = businessContinuityData.length > 0 ? Math.round((currentPlans / businessContinuityData.length) * 100) : 0;

    return [
      { id: "readiness", label: "Overall Readiness", value: `${overallReadiness}%` },
      { id: "total", label: "Total Plans", value: businessContinuityData.length },
      { id: "current", label: "Current", value: currentPlans },
      { id: "reviewNeeded", label: "Review Needed", value: reviewNeeded },
    ];
  }, [businessContinuityData]);

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
    <DataViewPage<BCPlan>
      config={businessContinuityPageConfig}
      data={businessContinuityData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["name", "category", "owner"]}
      onAction={handleAction}
    />
  );
}
