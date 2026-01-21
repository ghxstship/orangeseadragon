"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { incidentResponsePageConfig } from "@/config/pages/incident-response";

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "contained" | "resolved";
  reported_at: string;
  resolved_at?: string;
  assignee: string;
  affected_systems: string[];
}

export default function IncidentResponsePage() {
  const [incidentsData, setIncidentsData] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchIncidents() {
      try {
        const response = await fetch("/api/v1/incident-response");
        if (response.ok) {
          const result = await response.json();
          setIncidentsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch incidents:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchIncidents();
  }, []);

  const stats = React.useMemo(() => {
    const active = incidentsData.filter((i) => i.status !== "resolved").length;
    const resolved = incidentsData.filter((i) => i.status === "resolved").length;
    return [
      { id: "total", label: "Total Incidents", value: incidentsData.length },
      { id: "active", label: "Active", value: active },
      { id: "resolved", label: "Resolved This Week", value: resolved },
      { id: "avgTime", label: "Avg Resolution Time", value: "N/A" },
    ];
  }, [incidentsData]);

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
    <DataViewPage<Incident>
      config={incidentResponsePageConfig}
      data={incidentsData}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["title", "description", "assignee"]}
      onAction={handleAction}
    />
  );
}
