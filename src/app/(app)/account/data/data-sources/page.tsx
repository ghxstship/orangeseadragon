"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dataSourcesPageConfig } from "@/config/pages/data-sources";

interface DataSource {
  id: string;
  name: string;
  type: "database" | "api" | "file" | "stream";
  status: "connected" | "error" | "syncing";
  last_sync: string;
  records: number;
  provider: string;
}

export default function DataSourcesPage() {
  const [dataSourcesData, setDataSourcesData] = React.useState<DataSource[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDataSources() {
      try {
        const response = await fetch("/api/v1/data-sources");
        if (response.ok) {
          const result = await response.json();
          setDataSourcesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch data sources:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDataSources();
  }, []);

  const stats = React.useMemo(() => {
    const connectedCount = dataSourcesData.filter((d) => d.status === "connected").length;
    const totalRecords = dataSourcesData.reduce((acc, d) => acc + (d.records || 0), 0);
    const errorCount = dataSourcesData.filter((d) => d.status === "error").length;

    return [
      { id: "total", label: "Total Sources", value: dataSourcesData.length },
      { id: "connected", label: "Connected", value: connectedCount },
      { id: "errors", label: "Errors", value: errorCount },
      { id: "records", label: "Total Records", value: `${(totalRecords / 1000000).toFixed(1)}M` },
    ];
  }, [dataSourcesData]);

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
    <DataViewPage<DataSource>
      config={dataSourcesPageConfig}
      data={dataSourcesData}
      stats={stats}
      getRowId={(d) => d.id}
      searchFields={["name", "provider"]}
      onAction={handleAction}
    />
  );
}
