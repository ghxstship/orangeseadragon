"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dataCatalogPageConfig } from "@/config/pages/data-catalog";

interface CatalogEntry {
  id: string;
  name: string;
  type: "table" | "view" | "dataset";
  schema: string;
  description: string;
  columns: number;
  rows: number;
  last_updated: string;
  owner: string;
  tags: string[];
  starred: boolean;
}

export default function DataCatalogPage() {
  const [catalogEntriesData, setCatalogEntriesData] = React.useState<CatalogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCatalogEntries() {
      try {
        const response = await fetch("/api/v1/data-catalog");
        if (response.ok) {
          const result = await response.json();
          setCatalogEntriesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch catalog entries:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalogEntries();
  }, []);

  const stats = React.useMemo(() => {
    const totalTables = catalogEntriesData.filter((e) => e.type === "table").length;
    const totalViews = catalogEntriesData.filter((e) => e.type === "view").length;
    const totalRows = catalogEntriesData.reduce((acc, e) => acc + (e.rows || 0), 0);

    return [
      { id: "total", label: "Total Assets", value: catalogEntriesData.length },
      { id: "tables", label: "Tables", value: totalTables },
      { id: "views", label: "Views", value: totalViews },
      { id: "rows", label: "Total Rows", value: `${(totalRows / 1000000).toFixed(1)}M` },
    ];
  }, [catalogEntriesData]);

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
    <DataViewPage<CatalogEntry>
      config={dataCatalogPageConfig}
      data={catalogEntriesData}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["name", "schema", "description"]}
      onAction={handleAction}
    />
  );
}
