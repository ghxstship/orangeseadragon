"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { compliancePageConfig } from "@/config/pages/compliance";

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  status: "compliant" | "partial" | "non_compliant";
  score: number;
  last_audit?: string;
  next_audit?: string;
  controls: number;
  passed_controls: number;
}

export default function CompliancePage() {
  const [complianceData, setComplianceData] = React.useState<ComplianceFramework[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchComplianceData() {
      try {
        const response = await fetch("/api/v1/compliance");
        if (response.ok) {
          const result = await response.json();
          setComplianceData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch compliance data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchComplianceData();
  }, []);

  const stats = React.useMemo(() => {
    const compliantCount = complianceData.filter((f) => f.status === "compliant").length;
    const avgScore = complianceData.length > 0 ? Math.round(complianceData.reduce((acc, f) => acc + (f.score || 0), 0) / complianceData.length) : 0;
    const totalControls = complianceData.reduce((acc, f) => acc + (f.controls || 0), 0);
    const passedControls = complianceData.reduce((acc, f) => acc + (f.passed_controls || 0), 0);

    return [
      { id: "frameworks", label: "Frameworks", value: complianceData.length },
      { id: "compliant", label: "Fully Compliant", value: compliantCount },
      { id: "avgScore", label: "Average Score", value: `${avgScore}%` },
      { id: "controls", label: "Controls Passed", value: `${passedControls}/${totalControls}` },
    ];
  }, [complianceData]);

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
    <DataViewPage<ComplianceFramework>
      config={compliancePageConfig}
      data={complianceData}
      stats={stats}
      getRowId={(f) => f.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
