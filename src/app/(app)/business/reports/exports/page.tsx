"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { reportsExportsPageConfig } from "@/config/pages/reports-exports";

interface Export {
  id: string;
  name: string;
  format: string;
  size: string;
  exported_at: string;
  exported_by: string;
}

export default function ReportsExportsPage() {
  const [exports, setExports] = React.useState<Export[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchExports() {
      try {
        const response = await fetch("/api/v1/business/reports/exports");
        if (response.ok) {
          const result = await response.json();
          setExports(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch exports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchExports();
  }, []);

  const stats = React.useMemo(() => {
    return [
      { id: "total", label: "Total Exports", value: exports.length },
    ];
  }, [exports]);

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
    <DataViewPage<Export>
      config={reportsExportsPageConfig}
      data={exports}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["name", "exported_by"]}
      onAction={handleAction}
    />
  );
}
