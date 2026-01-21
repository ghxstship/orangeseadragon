"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { cdnManagementPageConfig } from "@/config/pages/cdn-management";

interface CDNEdge {
  id: string;
  location: string;
  region: string;
  status: "healthy" | "degraded" | "offline";
  hit_rate: number;
  bandwidth: number;
  requests: number;
}

export default function CDNManagementPage() {
  const [cdnEdgesData, setCdnEdgesData] = React.useState<CDNEdge[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCdnEdges() {
      try {
        const response = await fetch("/api/v1/cdn-management");
        if (response.ok) {
          const result = await response.json();
          setCdnEdgesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch CDN edges:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCdnEdges();
  }, []);

  const stats = React.useMemo(() => {
    const totalBandwidth = cdnEdgesData.reduce((acc, e) => acc + (e.bandwidth || 0), 0);
    const totalRequests = cdnEdgesData.reduce((acc, e) => acc + (e.requests || 0), 0);
    const avgHitRate = cdnEdgesData.length > 0
      ? cdnEdgesData.reduce((acc, e) => acc + (e.hit_rate || 0), 0) / cdnEdgesData.length
      : 0;
    return [
      { id: "edges", label: "Edge Locations", value: cdnEdgesData.length },
      { id: "hitRate", label: "Cache Hit Rate", value: `${avgHitRate.toFixed(1)}%` },
      { id: "bandwidth", label: "Bandwidth (24h)", value: `${(totalBandwidth / 1000).toFixed(1)} TB` },
      { id: "requests", label: "Requests (24h)", value: `${(totalRequests / 1000).toFixed(0)}K` },
    ];
  }, [cdnEdgesData]);

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
    <DataViewPage<CDNEdge>
      config={cdnManagementPageConfig}
      data={cdnEdgesData}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["location", "region"]}
      onAction={handleAction}
    />
  );
}
