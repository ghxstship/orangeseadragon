"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { apiKeysPageConfig } from "@/config/pages/api-keys";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  last_used: string;
  status: "active" | "inactive";
}

export default function AccountPlatformApiKeysPage() {
  const [apiKeysData, setApiKeysData] = React.useState<ApiKey[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchApiKeys() {
      try {
        const response = await fetch("/api/v1/account/platform/api-keys");
        if (response.ok) {
          const result = await response.json();
          setApiKeysData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch API keys:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApiKeys();
  }, []);

  const stats = React.useMemo(() => {
    const activeCount = apiKeysData.filter((k) => k.status === "active").length;
    const inactiveCount = apiKeysData.filter((k) => k.status === "inactive").length;
    return [
      { id: "total", label: "Total Keys", value: apiKeysData.length },
      { id: "active", label: "Active", value: activeCount },
      { id: "inactive", label: "Inactive", value: inactiveCount },
    ];
  }, [apiKeysData]);

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
    <DataViewPage<ApiKey>
      config={apiKeysPageConfig}
      data={apiKeysData}
      stats={stats}
      getRowId={(k) => k.id}
      searchFields={["name"]}
      onAction={handleAction}
    />
  );
}
