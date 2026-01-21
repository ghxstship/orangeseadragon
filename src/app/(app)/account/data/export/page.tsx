"use client";

import * as React from "react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dataExportPageConfig } from "@/config/pages/data-export";
import { Loader2 } from "lucide-react";

interface ExportJob {
  id: string;
  name: string;
  format: "csv" | "json" | "xlsx" | "pdf";
  data_type: string;
  status: "completed" | "processing" | "queued";
  created_at: string;
  size?: string;
  records?: number;
}

export default function DataExportPage() {
  const [exportJobsData, setExportJobsData] = React.useState<ExportJob[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchExportJobs() {
      try {
        const response = await fetch("/api/v1/data-export");
        if (response.ok) {
          const result = await response.json();
          setExportJobsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch export jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchExportJobs();
  }, []);

  const stats = React.useMemo(() => {
    return [
      { id: "total", label: "Total Exports", value: exportJobsData.length },
      { id: "completed", label: "Completed", value: exportJobsData.filter((j) => j.status === "completed").length },
      { id: "processing", label: "Processing", value: exportJobsData.filter((j) => j.status === "processing").length },
      { id: "queued", label: "Queued", value: exportJobsData.filter((j) => j.status === "queued").length },
    ];
  }, [exportJobsData]);

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
    <DataViewPage<ExportJob>
      config={dataExportPageConfig}
      data={exportJobsData}
      stats={stats}
      getRowId={(j) => j.id}
      searchFields={["name", "data_type"]}
      onAction={handleAction}
    />
  );
}
