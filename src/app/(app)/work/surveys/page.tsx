"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { surveysFeedbackPageConfig } from "@/config/pages/surveys-feedback";

interface Survey {
  id: string;
  name: string;
  eventName: string;
  type: string;
  status: string;
  createdDate: string;
  closingDate?: string;
  totalResponses: number;
  targetResponses: number;
  averageRating?: number;
  npsScore?: number;
  completionRate: number;
}

export default function SurveysFeedbackPage() {
  const [surveysData, setSurveysData] = React.useState<Survey[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSurveys() {
      try {
        const response = await fetch("/api/v1/surveys");
        if (response.ok) {
          const result = await response.json();
          setSurveysData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch surveys:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSurveys();
  }, []);

  const stats = React.useMemo(() => {
    const activeCount = surveysData.filter((s) => s.status === "active").length;
    const totalResponses = surveysData.reduce((acc, s) => acc + (s.totalResponses || 0), 0);
    const surveysWithNps = surveysData.filter((s) => s.npsScore !== undefined);
    const avgNps = surveysWithNps.length > 0
      ? Math.round(surveysWithNps.reduce((acc, s) => acc + (s.npsScore || 0), 0) / surveysWithNps.length)
      : 0;
    return [
      { id: "total", label: "Total Surveys", value: surveysData.length },
      { id: "active", label: "Active", value: activeCount },
      { id: "responses", label: "Total Responses", value: totalResponses },
      { id: "nps", label: "Avg NPS Score", value: avgNps },
    ];
  }, [surveysData]);

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
    <DataViewPage<Survey>
      config={surveysFeedbackPageConfig}
      data={surveysData}
      stats={stats}
      getRowId={(s) => s.id}
      searchFields={["name", "eventName"]}
      onAction={handleAction}
    />
  );
}
