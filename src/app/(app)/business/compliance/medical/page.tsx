"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { medicalPageConfig } from "@/config/pages/medical";

interface MedicalIncident {
  id: string;
  patient_name?: string;
  description: string;
  severity: "minor" | "moderate" | "serious" | "critical";
  location: string;
  event_name: string;
  reported_time: string;
  status: "active" | "treating" | "resolved" | "transported";
  responder?: string;
  treatment_notes?: string;
}

export default function MedicalPage() {
  const [medicalData, setMedicalData] = React.useState<MedicalIncident[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMedical() {
      try {
        const response = await fetch("/api/v1/medical");
        if (response.ok) {
          const result = await response.json();
          setMedicalData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch medical:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMedical();
  }, []);

  const stats = React.useMemo(() => {
    const active = medicalData.filter((i) => i.status === "active" || i.status === "treating").length;
    const resolved = medicalData.filter((i) => i.status === "resolved").length;
    const transported = medicalData.filter((i) => i.status === "transported").length;

    return [
      { id: "total", label: "Total Incidents", value: medicalData.length },
      { id: "active", label: "Active", value: active },
      { id: "resolved", label: "Resolved", value: resolved },
      { id: "transported", label: "Transported", value: transported },
    ];
  }, [medicalData]);

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
    <DataViewPage<MedicalIncident>
      config={medicalPageConfig}
      data={medicalData}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["description", "location", "event_name", "responder"]}
      onAction={handleAction}
    />
  );
}
