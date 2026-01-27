"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { alertingRulesPageConfig } from "@/config/pages/alerting-rules";

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  severity: "critical" | "warning" | "info";
  enabled: boolean;
  channels: string[];
  last_triggered?: string;
  trigger_count: number;
}

export default function AlertingRulesPage() {
  const [alertRules, setAlertRules] = React.useState<AlertRule[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAlertRules() {
      try {
        const response = await fetch("/api/v1/alerting-rules");
        if (response.ok) {
          const result = await response.json();
          setAlertRules(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch alerting rules:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAlertRules();
  }, []);

  const stats = React.useMemo(() => {
    const enabledRules = alertRules.filter((r) => r.enabled).length;
    const criticalRules = alertRules.filter((r) => r.severity === "critical" && r.enabled).length;
    const totalTriggers = alertRules.reduce((acc, r) => acc + (r.trigger_count || 0), 0);
    return [
      { id: "total", label: "Total Rules", value: alertRules.length },
      { id: "enabled", label: "Enabled", value: enabledRules },
      { id: "critical", label: "Critical", value: criticalRules },
      { id: "triggers", label: "Triggers (30d)", value: totalTriggers },
    ];
  }, [alertRules]);

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
    <DataViewPage<AlertRule>
      config={alertingRulesPageConfig}
      data={alertRules}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
