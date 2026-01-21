"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { reportsPageConfig } from "@/config/pages/reports";

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "chart" | "table" | "summary";
  last_run: string;
  schedule: string | null;
  is_favorite: boolean;
}

export default function ReportsPage() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch("/api/v1/reports");
        if (response.ok) {
          const result = await response.json();
          setReports(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const stats = React.useMemo(() => {
    const scheduled = reports.filter((r) => r.schedule).length;
    const favorites = reports.filter((r) => r.is_favorite).length;
    const categories = new Set(reports.map((r) => r.category)).size;

    return [
      { id: "total", label: "Total Reports", value: reports.length },
      { id: "scheduled", label: "Scheduled", value: scheduled },
      { id: "favorites", label: "Favorites", value: favorites },
      { id: "categories", label: "Categories", value: categories },
    ];
  }, [reports]);

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
    <DataViewPage<Report>
      config={reportsPageConfig}
      data={reports}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["name", "description", "category"]}
      onAction={handleAction}
    />
  );
}
