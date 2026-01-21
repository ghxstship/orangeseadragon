"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { integrationsPageConfig } from "@/config/pages/integrations";

interface Integration {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected";
  icon: string;
}

export default function AccountOrganizationIntegrationsPage() {
  const [integrationsData, setIntegrationsData] = React.useState<Integration[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchIntegrations() {
      try {
        const response = await fetch("/api/v1/account/organization/integrations");
        if (response.ok) {
          const result = await response.json();
          setIntegrationsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch integrations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchIntegrations();
  }, []);

  const stats = React.useMemo(() => {
    const connectedCount = integrationsData.filter((i) => i.status === "connected").length;
    const disconnectedCount = integrationsData.filter((i) => i.status === "disconnected").length;
    return [
      { id: "total", label: "Total Integrations", value: integrationsData.length },
      { id: "connected", label: "Connected", value: connectedCount },
      { id: "disconnected", label: "Disconnected", value: disconnectedCount },
    ];
  }, [integrationsData]);

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
    <DataViewPage<Integration>
      config={integrationsPageConfig}
      data={integrationsData}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
