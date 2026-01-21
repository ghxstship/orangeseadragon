"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { complianceAuditsPageConfig } from "@/config/pages/compliance-audits";

interface Audit {
  id: string;
  name: string;
  type: string;
  status: string;
  scheduled_date: string;
  auditor: string;
}

export default function ComplianceAuditsPage() {
  const [audits, setAudits] = React.useState<Audit[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAudits() {
      try {
        const response = await fetch("/api/v1/business/compliance/audits");
        if (response.ok) {
          const result = await response.json();
          setAudits(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch audits:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAudits();
  }, []);

  const stats = React.useMemo(() => {
    const scheduledCount = audits.filter((a) => a.status === "scheduled").length;
    const completedCount = audits.filter((a) => a.status === "completed").length;

    return [
      { id: "total", label: "Total Audits", value: audits.length },
      { id: "scheduled", label: "Scheduled", value: scheduledCount },
      { id: "completed", label: "Completed", value: completedCount },
    ];
  }, [audits]);

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
    <DataViewPage<Audit>
      config={complianceAuditsPageConfig}
      data={audits}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["name", "type", "auditor"]}
      onAction={handleAction}
    />
  );
}
