"use client";

import * as React from "react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dataImportPageConfig } from "@/config/pages/data-import";
import { Loader2 } from "lucide-react";

interface ImportJob {
  id: string;
  name: string;
  format: "csv" | "json" | "xlsx";
  data_type: string;
  status: "completed" | "processing" | "failed" | "validating";
  created_at: string;
  records?: number;
  errors?: number;
  progress?: number;
}

export default function DataImportPage() {
  const [importJobsData, setImportJobsData] = React.useState<ImportJob[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchImportJobs() {
      try {
        const response = await fetch("/api/v1/data-import");
        if (response.ok) {
          const result = await response.json();
          setImportJobsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch import jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchImportJobs();
  }, []);

  const stats = React.useMemo(() => {
    const completedCount = importJobsData.filter((j) => j.status === "completed").length;
    const failedCount = importJobsData.filter((j) => j.status === "failed").length;
    const totalRecords = importJobsData.reduce((acc, j) => acc + (j.records || 0), 0);

    return [
      { id: "total", label: "Total Imports", value: importJobsData.length },
      { id: "completed", label: "Completed", value: completedCount },
      { id: "failed", label: "Failed", value: failedCount },
      { id: "records", label: "Records Imported", value: totalRecords.toLocaleString() },
    ];
  }, [importJobsData]);

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
    <DataViewPage<ImportJob>
      config={dataImportPageConfig}
      data={importJobsData}
      stats={stats}
      getRowId={(j) => j.id}
      searchFields={["name", "data_type"]}
      onAction={handleAction}
    />
  );
}
