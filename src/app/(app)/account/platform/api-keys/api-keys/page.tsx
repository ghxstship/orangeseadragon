"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { apiKeysPageConfig } from "@/config/pages/api-keys";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used?: string;
  expires_at?: string;
  status: "active" | "expired" | "revoked";
  permissions: string[];
  usage_count: number;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = React.useState<ApiKey[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchApiKeys() {
      try {
        const response = await fetch("/api/v1/api-keys");
        if (response.ok) {
          const result = await response.json();
          setApiKeys(result.data || []);
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
    const active = apiKeys.filter((k) => k.status === "active").length;
    const totalUsage = apiKeys.reduce((acc, k) => acc + (k.usage_count || 0), 0);
    return [
      { id: "total", label: "Total Keys", value: apiKeys.length },
      { id: "active", label: "Active", value: active },
      { id: "usage", label: "Total API Calls", value: totalUsage },
    ];
  }, [apiKeys]);

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
      data={apiKeys}
      stats={stats}
      getRowId={(k) => k.id}
      searchFields={["name", "key_prefix"]}
      onAction={handleAction}
    />
  );
}
