"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { incidentReportsPageConfig } from "@/config/pages/incident-reports";

interface IncidentReport {
  id: string;
  title: string;
  description: string;
  event_name: string;
  location: string;
  incident_date: string;
  reported_by: string;
  severity: "minor" | "moderate" | "major" | "critical";
  category: "safety" | "security" | "medical" | "property" | "weather" | "other";
  status: "reported" | "investigating" | "resolved" | "closed";
  witnesses?: number;
  follow_up_required: boolean;
}

export default function IncidentReportsPage() {
  const [incidentReportsData, setIncidentReportsData] = React.useState<IncidentReport[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchIncidentReports() {
      try {
        const response = await fetch("/api/v1/incident-reports");
        if (response.ok) {
          const result = await response.json();
          setIncidentReportsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch incident reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchIncidentReports();
  }, []);

  const stats = React.useMemo(() => {
    const open = incidentReportsData.filter((i) => i.status === "reported" || i.status === "investigating").length;
    const resolved = incidentReportsData.filter((i) => i.status === "resolved" || i.status === "closed").length;
    const followUp = incidentReportsData.filter((i) => i.follow_up_required).length;

    return [
      { id: "total", label: "Total Incidents", value: incidentReportsData.length },
      { id: "open", label: "Open", value: open },
      { id: "resolved", label: "Resolved", value: resolved },
      { id: "followup", label: "Requires Follow-up", value: followUp },
    ];
  }, [incidentReportsData]);

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
    <DataViewPage<IncidentReport>
      config={incidentReportsPageConfig}
      data={incidentReportsData}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["title", "description", "event_name", "location"]}
      onAction={handleAction}
    />
  );
}
