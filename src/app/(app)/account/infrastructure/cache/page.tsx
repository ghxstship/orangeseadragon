"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { cacheManagementPageConfig } from "@/config/pages/cache-management";

interface CacheInstance {
  id: string;
  name: string;
  type: string;
  status: "healthy" | "warning" | "critical";
  memory: number;
  max_memory: number;
  hit_rate: number;
  keys: number;
  region: string;
}

export default function CacheManagementPage() {
  const [cacheManagementData, setCacheManagementData] = React.useState<CacheInstance[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCaches() {
      try {
        const response = await fetch("/api/v1/cache-management");
        if (response.ok) {
          const result = await response.json();
          setCacheManagementData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch cache data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCaches();
  }, []);

  const stats = React.useMemo(() => {
    const totalMemory = cacheManagementData.reduce((acc, c) => acc + (c.memory || 0), 0);
    const totalKeys = cacheManagementData.reduce((acc, c) => acc + (c.keys || 0), 0);
    const avgHitRate = cacheManagementData.length > 0
      ? cacheManagementData.reduce((acc, c) => acc + (c.hit_rate || 0), 0) / cacheManagementData.length
      : 0;
    return [
      { id: "memory", label: "Total Memory", value: `${totalMemory.toFixed(1)} GB` },
      { id: "keys", label: "Total Keys", value: `${(totalKeys / 1000).toFixed(0)}K` },
      { id: "hitRate", label: "Hit Rate", value: `${avgHitRate.toFixed(1)}%` },
      { id: "instances", label: "Instances", value: cacheManagementData.length },
    ];
  }, [cacheManagementData]);

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
    <DataViewPage<CacheInstance>
      config={cacheManagementPageConfig}
      data={cacheManagementData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["name", "type", "region"]}
      onAction={handleAction}
    />
  );
}
