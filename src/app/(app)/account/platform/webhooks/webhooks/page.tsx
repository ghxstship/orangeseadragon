"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { webhooksPageConfig } from "@/config/pages/webhooks";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive" | "failing";
  created_at: string;
  last_triggered?: string;
  success_rate: number;
  total_deliveries: number;
  failed_deliveries: number;
}

export default function WebhooksPage() {
  const [webhooksData, setWebhooksData] = React.useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchWebhooks() {
      try {
        const response = await fetch("/api/v1/webhooks");
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
    const active = webhooksData.filter((w) => w.status === "active").length;
    const failing = webhooksData.filter((w) => w.status === "failing").length;
    const totalDeliveries = webhooksData.reduce((acc, w) => acc + (w.total_deliveries || 0), 0);
    return [
      { id: "total", label: "Total Endpoints", value: webhooksData.length },
      { id: "active", label: "Active", value: active },
      { id: "failing", label: "Failing", value: failing },
      { id: "deliveries", label: "Total Deliveries", value: totalDeliveries },
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
    <DataViewPage<WebhookEndpoint>
      config={webhooksPageConfig}
      data={webhooksData}
      stats={stats}
      getRowId={(w) => w.id}
      searchFields={["name", "url"]}
      onAction={handleAction}
    />
  );
}
