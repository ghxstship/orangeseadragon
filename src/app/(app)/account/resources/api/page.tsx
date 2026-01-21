"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { apiReferencePageConfig } from "@/config/pages/api-reference";

interface ApiEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  category: string;
}

export default function AccountResourcesApiPage() {
  const [apiEndpointsData, setApiEndpointsData] = React.useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchApiEndpoints() {
      try {
        const response = await fetch("/api/v1/account/resources/api");
        if (response.ok) {
          const result = await response.json();
          setApiEndpointsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch API endpoints:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApiEndpoints();
  }, []);

  const stats = React.useMemo(() => {
    return [
      { id: "version", label: "API Version", value: "v1.2.0" },
      { id: "endpoints", label: "Endpoints", value: apiEndpointsData.length },
      { id: "rateLimit", label: "Rate Limit", value: "1000/hr" },
      { id: "uptime", label: "Uptime", value: "99.9%" },
    ];
  }, [apiEndpointsData]);

  const handleAction = React.useCallback(
    (actionId: string, payload?: unknown) => {
      switch (actionId) {
        case "docs":
          window.open("/docs/api", "_blank");
          break;
        case "view":
          console.log("View endpoint details", payload);
          break;
        case "try":
          console.log("Try endpoint", payload);
          break;
        case "copy":
          console.log("Copy path", payload);
          break;
        default:
          console.log("Unknown action:", actionId, payload);
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<ApiEndpoint>
      config={apiReferencePageConfig}
      data={apiEndpointsData}
      stats={stats}
      getRowId={(endpoint) => endpoint.id}
      searchFields={["name", "path", "description"]}
      onAction={handleAction}
    />
  );
}
