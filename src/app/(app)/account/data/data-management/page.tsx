"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dataManagementPageConfig } from "@/config/pages/data-management";

interface DataCategory {
  id: string;
  name: string;
  size: number;
  records: number;
  last_updated: string;
  retention_policy: string;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function DataManagementPage() {
  const [dataCategoriesData, setDataCategoriesData] = React.useState<DataCategory[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDataCategories() {
      try {
        const response = await fetch("/api/v1/data-management");
        if (response.ok) {
          const result = await response.json();
          setDataCategoriesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch data categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDataCategories();
  }, []);

  const stats = React.useMemo(() => {
    const totalSize = dataCategoriesData.reduce((acc, c) => acc + (c.size || 0), 0);
    const totalRecords = dataCategoriesData.reduce((acc, c) => acc + (c.records || 0), 0);

    return [
      { id: "storage", label: "Storage Used", value: `${totalSize.toFixed(1)} GB` },
      { id: "records", label: "Total Records", value: formatNumber(totalRecords) },
      { id: "archived", label: "Archived", value: "2.8 GB" },
      { id: "trash", label: "Trash", value: "450 MB" },
    ];
  }, [dataCategoriesData]);

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
    <DataViewPage<DataCategory>
      config={dataManagementPageConfig}
      data={dataCategoriesData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["name"]}
      onAction={handleAction}
    />
  );
}
