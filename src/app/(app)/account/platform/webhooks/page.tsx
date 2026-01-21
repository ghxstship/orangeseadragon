"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { webhooksPageConfig } from "@/config/pages/webhooks";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  last_triggered: string;
}

export default function AccountPlatformWebhooksPage() {
  const [webhooksData, setWebhooksData] = React.useState<Webhook[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchWebhooks() {
      try {
        const response = await fetch("/api/v1/account/platform/webhooks");
        if (response.ok) {
          const result = await response.json();
          setWebhooksData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch webhooks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWebhooks();
  }, []);

  const stats = React.useMemo(() => {
    const activeCount = webhooksData.filter((w) => w.status === "active").length;
    const totalEvents = webhooksData.reduce((acc, w) => acc + (w.events?.length || 0), 0);
    return [
      { id: "total", label: "Total Webhooks", value: webhooksData.length },
      { id: "active", label: "Active", value: activeCount },
      { id: "events", label: "Event Types", value: totalEvents },
    ];
  }, [webhooksData]);

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
    <DataViewPage<Webhook>
      config={webhooksPageConfig}
      data={webhooksData}
      stats={stats}
      getRowId={(w) => w.id}
      searchFields={["url"]}
      onAction={handleAction}
    />
  );
}
