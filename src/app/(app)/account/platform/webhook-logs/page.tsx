"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { webhookLogsPageConfig } from "@/config/pages/webhook-logs";

interface WebhookLog {
  id: string;
  endpoint: string;
  event: string;
  status: "success" | "failed" | "pending" | "retrying";
  statusCode?: number;
  timestamp: string;
  duration: number;
  attempts: number;
}

export default function WebhookLogsPage() {
  const [logsData, setLogsData] = React.useState<WebhookLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch("/api/v1/webhook-logs");
        if (response.ok) {
          const result = await response.json();
          setLogsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch webhook logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const stats = React.useMemo(() => {
    const successCount = logsData.filter((l) => l.status === "success").length;
    const failedCount = logsData.filter((l) => l.status === "failed").length;
    const successRate = logsData.length > 0 ? Math.round((successCount / logsData.length) * 100) : 0;

    return [
      { id: "total", label: "Total Webhooks", value: logsData.length },
      { id: "success", label: "Successful", value: successCount },
      { id: "failed", label: "Failed", value: failedCount },
      { id: "rate", label: "Success Rate", value: `${successRate}%` },
    ];
  }, [logsData]);

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
    <DataViewPage<WebhookLog>
      config={webhookLogsPageConfig}
      data={logsData}
      stats={stats}
      getRowId={(l) => l.id}
      searchFields={["event", "endpoint"]}
      onAction={handleAction}
    />
  );
}
