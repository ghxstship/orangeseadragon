"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { archivesPageConfig } from "@/config/pages/archives";

interface ArchivedItem {
  id: string;
  name: string;
  type: "event" | "project" | "document" | "contract" | "report";
  original_location: string;
  archived_date: string;
  archived_by: string;
  size: string;
  retention_period: string;
  expiry_date?: string;
}

export default function ArchivesPage() {
  const [archivesData, setArchivesData] = React.useState<ArchivedItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchArchivesData() {
      try {
        const response = await fetch("/api/v1/archives");
        if (response.ok) {
          const result = await response.json();
          setArchivesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch archives data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArchivesData();
  }, []);

  const stats = React.useMemo(() => {
    const events = archivesData.filter((i) => i.type === "event").length;
    const documents = archivesData.filter((i) => i.type === "document" || i.type === "contract" || i.type === "report").length;

    return [
      { id: "total", label: "Total Archived", value: archivesData.length },
      { id: "events", label: "Events", value: events },
      { id: "documents", label: "Documents", value: documents },
      { id: "storage", label: "Storage Used", value: "9.5 GB" },
    ];
  }, [archivesData]);

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
    <DataViewPage<ArchivedItem>
      config={archivesPageConfig}
      data={archivesData}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["name", "original_location", "archived_by"]}
      onAction={handleAction}
    />
  );
}
