"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { notificationRulesPageConfig } from "@/config/pages/notification-rules";

interface NotificationRule {
  id: string;
  name: string;
  trigger: string;
  channels: string[];
  recipients: string;
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

export default function NotificationRulesPage() {
  const [rulesData, setRulesData] = React.useState<NotificationRule[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRules() {
      try {
        const response = await fetch("/api/v1/notification-rules");
        if (response.ok) {
          const result = await response.json();
          setRulesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch notification rules:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRules();
  }, []);

  const stats = React.useMemo(() => {
    const enabledCount = rulesData.filter((r) => r.enabled).length;
    const totalTriggers = rulesData.reduce((acc, r) => acc + (r.triggerCount || 0), 0);
    return [
      { id: "total", label: "Total Rules", value: rulesData.length },
      { id: "enabled", label: "Enabled", value: enabledCount },
      { id: "triggers", label: "Total Triggers", value: totalTriggers },
      { id: "channels", label: "Channels", value: 4 },
    ];
  }, [rulesData]);

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
    <DataViewPage<NotificationRule>
      config={notificationRulesPageConfig}
      data={rulesData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["name", "trigger"]}
      onAction={handleAction}
    />
  );
}
