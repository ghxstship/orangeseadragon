"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dataRetentionPageConfig } from "@/config/pages/data-retention";

interface RetentionPolicy {
  id: string;
  name: string;
  data_type: string;
  retention_period: string;
  action: "archive" | "delete" | "anonymize";
  enabled: boolean;
  last_run?: string;
  next_run?: string;
  records_affected?: number;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function DataRetentionPage() {
  const [retentionPoliciesData, setRetentionPoliciesData] = React.useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRetentionPolicies() {
      try {
        const response = await fetch("/api/v1/data-retention");
        if (response.ok) {
          const result = await response.json();
          setRetentionPoliciesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch retention policies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRetentionPolicies();
  }, []);

  const stats = React.useMemo(() => {
    const enabledPolicies = retentionPoliciesData.filter((p) => p.enabled).length;
    const totalRecordsAffected = retentionPoliciesData.reduce((acc, p) => acc + (p.records_affected || 0), 0);

    return [
      { id: "total", label: "Total Policies", value: retentionPoliciesData.length },
      { id: "active", label: "Active Policies", value: enabledPolicies },
      { id: "records", label: "Records Managed", value: formatNumber(totalRecordsAffected) },
      { id: "nextRun", label: "Next Run", value: "June 21, 2024" },
    ];
  }, [retentionPoliciesData]);

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
    <DataViewPage<RetentionPolicy>
      config={dataRetentionPageConfig}
      data={retentionPoliciesData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["name", "data_type"]}
      onAction={handleAction}
    />
  );
}
