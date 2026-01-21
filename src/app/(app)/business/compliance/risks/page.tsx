"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { complianceRisksPageConfig } from "@/config/pages/compliance-risks";

interface Risk {
  id: string;
  name: string;
  category: string;
  likelihood: string;
  impact: string;
  status: string;
}

export default function ComplianceRisksPage() {
  const [risks, setRisks] = React.useState<Risk[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRisks() {
      try {
        const response = await fetch("/api/v1/business/compliance/risks");
        if (response.ok) {
          const result = await response.json();
          setRisks(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch risks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRisks();
  }, []);

  const stats = React.useMemo(() => {
    const highImpactCount = risks.filter((r) => r.impact === "high").length;
    const mitigatedCount = risks.filter((r) => r.status === "mitigated").length;
    return [
      { id: "total", label: "Total Risks", value: risks.length },
      { id: "high", label: "High Impact", value: highImpactCount },
      { id: "mitigated", label: "Mitigated", value: mitigatedCount },
    ];
  }, [risks]);

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
    <DataViewPage<Risk>
      config={complianceRisksPageConfig}
      data={risks}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["name", "category"]}
      onAction={handleAction}
    />
  );
}
