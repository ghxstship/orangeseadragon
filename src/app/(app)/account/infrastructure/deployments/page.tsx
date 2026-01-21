"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { deploymentHistoryPageConfig } from "@/config/pages/deployment-history";

interface Deployment {
  id: string;
  version: string;
  environment: "production" | "staging" | "development";
  status: "success" | "failed" | "in_progress" | "rolled_back";
  deployed_by: string;
  deployed_at: string;
  duration: string;
  commit: string;
  branch: string;
}

export default function DeploymentHistoryPage() {
  const [deploymentsData, setDeploymentsData] = React.useState<Deployment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDeployments() {
      try {
        const response = await fetch("/api/v1/deployment-history");
        if (response.ok) {
          const result = await response.json();
          setDeploymentsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch deployments:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDeployments();
  }, []);

  const stats = React.useMemo(() => {
    const successCount = deploymentsData.filter((d) => d.status === "success").length;
    const prodDeployments = deploymentsData.filter((d) => d.environment === "production").length;

    return [
      { id: "total", label: "Total Deployments", value: deploymentsData.length },
      { id: "successful", label: "Successful", value: successCount },
      { id: "production", label: "Production", value: prodDeployments },
      { id: "version", label: "Current Version", value: "v2.4.1" },
    ];
  }, [deploymentsData]);

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
    <DataViewPage<Deployment>
      config={deploymentHistoryPageConfig}
      data={deploymentsData}
      stats={stats}
      getRowId={(d) => d.id}
      searchFields={["version", "deployed_by", "branch"]}
      onAction={handleAction}
    />
  );
}
