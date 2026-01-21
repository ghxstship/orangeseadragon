"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { reportsScheduledPageConfig } from "@/config/pages/reports-scheduled";

interface ScheduledReport {
  id: string;
  name: string;
  frequency: string;
  next_run: string;
  recipients: number;
  status: string;
}

export default function ReportsScheduledPage() {
  const [scheduledReports, setScheduledReports] = React.useState<ScheduledReport[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchScheduledReports() {
      try {
        const response = await fetch("/api/v1/business/reports/scheduled");
        if (response.ok) {
          const result = await response.json();
          setScheduledReports(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch scheduled reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchScheduledReports();
  }, []);

  const stats = React.useMemo(() => {
    const activeCount = scheduledReports.filter((r) => r.status === "active").length;
    const totalRecipients = scheduledReports.reduce((s, r) => s + (r.recipients || 0), 0);
    return [
      { id: "total", label: "Scheduled", value: scheduledReports.length },
      { id: "active", label: "Active", value: activeCount },
      { id: "recipients", label: "Total Recipients", value: totalRecipients },
    ];
  }, [scheduledReports]);

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
    <DataViewPage<ScheduledReport>
      config={reportsScheduledPageConfig}
      data={scheduledReports}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["name"]}
      onAction={handleAction}
    />
  );
}
