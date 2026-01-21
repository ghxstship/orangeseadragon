"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { savedViewsPageConfig } from "@/config/pages/saved-views";

interface SavedView {
  id: string;
  name: string;
  description: string;
  module: "events" | "contacts" | "invoices" | "vendors";
  filters: number;
  columns: number;
  isDefault: boolean;
  createdAt: string;
  lastUsed: string;
}

export default function SavedViewsPage() {
  const [savedViewsData, setSavedViewsData] = React.useState<SavedView[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSavedViews() {
      try {
        const response = await fetch("/api/v1/saved-views");
        if (response.ok) {
          const result = await response.json();
          setSavedViewsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch saved views:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSavedViews();
  }, []);

  const stats = React.useMemo(() => {
    const eventsCount = savedViewsData.filter((v) => v.module === "events").length;
    const contactsCount = savedViewsData.filter((v) => v.module === "contacts").length;
    const financialCount = savedViewsData.filter((v) => v.module === "invoices" || v.module === "vendors").length;
    return [
      { id: "total", label: "Total Views", value: savedViewsData.length },
      { id: "events", label: "Events", value: eventsCount },
      { id: "contacts", label: "Contacts", value: contactsCount },
      { id: "financial", label: "Financial", value: financialCount },
    ];
  }, [savedViewsData]);

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
    <DataViewPage<SavedView>
      config={savedViewsPageConfig}
      data={savedViewsData}
      stats={stats}
      getRowId={(v) => v.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
