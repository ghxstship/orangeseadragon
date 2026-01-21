"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { disasterRecoveryPageConfig } from "@/config/pages/disaster-recovery";

interface RecoveryTarget {
  id: string;
  name: string;
  type: string;
  rto: string;
  rpo: string;
  status: "healthy" | "warning" | "critical";
  last_tested: string;
}

export default function DisasterRecoveryPage() {
  const [recoveryTargetsData, setRecoveryTargetsData] = React.useState<RecoveryTarget[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRecoveryTargets() {
      try {
        const response = await fetch("/api/v1/disaster-recovery");
        if (response.ok) {
          const result = await response.json();
          setRecoveryTargetsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch recovery targets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecoveryTargets();
  }, []);

  const stats = React.useMemo(() => {
    const healthyCount = recoveryTargetsData.filter((t) => t.status === "healthy").length;

    return [
      { id: "status", label: "DR Status", value: "Ready" },
      { id: "protected", label: "Systems Protected", value: `${healthyCount}/${recoveryTargetsData.length}` },
      { id: "rto", label: "Target RTO", value: "30 min" },
      { id: "lastTest", label: "Last DR Test", value: "June 10, 2024" },
    ];
  }, [recoveryTargetsData]);

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
    <DataViewPage<RecoveryTarget>
      config={disasterRecoveryPageConfig}
      data={recoveryTargetsData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["name", "type"]}
      onAction={handleAction}
    />
  );
}
