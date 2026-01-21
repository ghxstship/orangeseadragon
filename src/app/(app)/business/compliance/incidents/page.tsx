"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { complianceIncidentsPageConfig } from "@/config/pages/compliance-incidents";

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  reported_at: string;
  resolved_at: string | null;
}

export default function ComplianceIncidentsPage() {
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchIncidents() {
      try {
        const response = await fetch("/api/v1/business/compliance/incidents");
        if (response.ok) {
          const result = await response.json();
          setIncidents(result.data || []);
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
    const openCount = incidents.filter((i) => i.status !== "resolved").length;
    const resolvedCount = incidents.filter((i) => i.status === "resolved").length;

    return [
      { id: "total", label: "Total Incidents", value: incidents.length },
      { id: "open", label: "Open", value: openCount },
      { id: "resolved", label: "Resolved", value: resolvedCount },
    ];
  }, [incidents]);

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
      config={complianceIncidentsPageConfig}
      data={incidents}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["title"]}
      onAction={handleAction}
    />
  );
}
