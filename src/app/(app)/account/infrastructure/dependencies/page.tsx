"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dependencyGraphPageConfig } from "@/config/pages/dependency-graph";

interface ServiceDependency {
  id: string;
  name: string;
  version: string;
  status: "healthy" | "degraded" | "down";
  dependencies: string[];
  dependents: string[];
}

export default function DependencyGraphPage() {
  const [servicesData, setServicesData] = React.useState<ServiceDependency[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch("/api/v1/dependency-graph");
        if (response.ok) {
          const result = await response.json();
          setServicesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const stats = React.useMemo(() => {
    const healthyCount = servicesData.filter((s) => s.status === "healthy").length;
    const totalDependencies = servicesData.reduce((acc, s) => acc + (s.dependencies?.length || 0), 0);

    return [
      { id: "services", label: "Services", value: servicesData.length },
      { id: "dependencies", label: "Dependencies", value: totalDependencies },
      { id: "healthy", label: "Healthy", value: healthyCount },
      { id: "criticalPath", label: "Critical Path", value: 4 },
    ];
  }, [servicesData]);

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
    <DataViewPage<ServiceDependency>
      config={dependencyGraphPageConfig}
      data={servicesData}
      stats={stats}
      getRowId={(s) => s.id}
      searchFields={["name", "version"]}
      onAction={handleAction}
    />
  );
}
