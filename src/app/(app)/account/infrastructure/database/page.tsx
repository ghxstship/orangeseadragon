"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { databaseManagementPageConfig } from "@/config/pages/database-management";

interface DatabaseInstance {
  id: string;
  name: string;
  type: string;
  role: "primary" | "replica";
  status: "healthy" | "warning" | "critical";
  connections: number;
  max_connections: number;
  storage: number;
  max_storage: number;
  region: string;
  version: string;
}

export default function DatabaseManagementPage() {
  const [databasesData, setDatabasesData] = React.useState<DatabaseInstance[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDatabases() {
      try {
        const response = await fetch("/api/v1/database-management");
        if (response.ok) {
          const result = await response.json();
          setDatabasesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch databases:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDatabases();
  }, []);

  const stats = React.useMemo(() => {
    const totalConnections = databasesData.reduce((acc, d) => acc + (d.connections || 0), 0);
    const replicaCount = databasesData.filter((d) => d.role === "replica").length;

    return [
      { id: "total", label: "Total Instances", value: databasesData.length },
      { id: "replicas", label: "Replicas", value: replicaCount },
      { id: "connections", label: "Total Connections", value: totalConnections },
      { id: "lag", label: "Replication Lag", value: "2ms" },
    ];
  }, [databasesData]);

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
    <DataViewPage<DatabaseInstance>
      config={databaseManagementPageConfig}
      data={databasesData}
      stats={stats}
      getRowId={(d) => d.id}
      searchFields={["name", "type", "region"]}
      onAction={handleAction}
    />
  );
}
