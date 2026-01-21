"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dataQualityPageConfig } from "@/config/pages/data-quality";

interface QualityRule {
  id: string;
  name: string;
  table: string;
  type: "completeness" | "accuracy" | "consistency" | "uniqueness";
  status: "passing" | "warning" | "failing";
  score: number;
  last_checked: string;
  issues: number;
}

export default function DataQualityPage() {
  const [qualityRulesData, setQualityRulesData] = React.useState<QualityRule[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchQualityRules() {
      try {
        const response = await fetch("/api/v1/data-quality");
        if (response.ok) {
          const result = await response.json();
          setQualityRulesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch quality rules:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQualityRules();
  }, []);

  const stats = React.useMemo(() => {
    const passingCount = qualityRulesData.filter((r) => r.status === "passing").length;
    const avgScore = qualityRulesData.length > 0 ? Math.round(qualityRulesData.reduce((acc, r) => acc + (r.score || 0), 0) / qualityRulesData.length) : 0;
    const totalIssues = qualityRulesData.reduce((acc, r) => acc + (r.issues || 0), 0);

    return [
      { id: "score", label: "Overall Score", value: `${avgScore}%` },
      { id: "passing", label: "Rules Passing", value: `${passingCount}/${qualityRulesData.length}` },
      { id: "issues", label: "Total Issues", value: totalIssues.toLocaleString() },
      { id: "lastCheck", label: "Last Check", value: "Just now" },
    ];
  }, [qualityRulesData]);

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
    <DataViewPage<QualityRule>
      config={dataQualityPageConfig}
      data={qualityRulesData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["name", "table"]}
      onAction={handleAction}
    />
  );
}
