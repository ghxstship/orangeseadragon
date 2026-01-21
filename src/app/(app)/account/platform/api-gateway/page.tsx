"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { apiGatewayPageConfig } from "@/config/pages/api-gateway";

interface APIEndpoint {
  id: string;
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  requests: number;
  avg_latency: number;
  error_rate: number;
  rate_limit: number;
}

export default function APIGatewayPage() {
  const [apiGatewayData, setApiGatewayData] = React.useState<APIEndpoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchApiGateway() {
      try {
        const response = await fetch("/api/v1/api-gateway");
        if (response.ok) {
          const result = await response.json();
          setApiGatewayData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch API gateway data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApiGateway();
  }, []);

  const stats = React.useMemo(() => {
    const totalRequests = apiGatewayData.reduce((acc, e) => acc + (e.requests || 0), 0);
    const avgLatency = apiGatewayData.length > 0 ? Math.round(apiGatewayData.reduce((acc, e) => acc + (e.avg_latency || 0), 0) / apiGatewayData.length) : 0;
    const avgErrorRate = apiGatewayData.length > 0 ? (apiGatewayData.reduce((acc, e) => acc + (e.error_rate || 0), 0) / apiGatewayData.length).toFixed(2) : "0.00";

    return [
      { id: "requests", label: "Requests (24h)", value: `${(totalRequests / 1000).toFixed(0)}K` },
      { id: "latency", label: "Avg Latency", value: `${avgLatency}ms` },
      { id: "errorRate", label: "Error Rate", value: `${avgErrorRate}%` },
      { id: "endpoints", label: "Endpoints", value: apiGatewayData.length },
    ];
  }, [apiGatewayData]);

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
    <DataViewPage<APIEndpoint>
      config={apiGatewayPageConfig}
      data={apiGatewayData}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["path", "method"]}
      onAction={handleAction}
    />
  );
}
