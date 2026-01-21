"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { savedFiltersPageConfig } from "@/config/pages/saved-filters";

interface SavedFilter {
  id: string;
  name: string;
  description: string;
  target_module: "events" | "contacts" | "invoices" | "vendors";
  conditions: number;
  created_at: string;
  last_used: string;
  usage_count: number;
}

export default function SavedFiltersPage() {
  const [savedFiltersData, setSavedFiltersData] = React.useState<SavedFilter[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSavedFilters() {
      try {
        const response = await fetch("/api/v1/saved-filters");
        if (response.ok) {
          const result = await response.json();
          setSavedFiltersData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch saved filters:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSavedFilters();
  }, []);

  const stats = React.useMemo(() => {
    const totalUses = savedFiltersData.reduce((acc, f) => acc + (f.usage_count || 0), 0);
    return [
      { id: "total", label: "Total Filters", value: savedFiltersData.length },
      { id: "uses", label: "Total Uses", value: totalUses },
    ];
  }, [savedFiltersData]);

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
    <DataViewPage<SavedFilter>
      config={savedFiltersPageConfig}
      data={savedFiltersData}
      stats={stats}
      getRowId={(f) => f.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
