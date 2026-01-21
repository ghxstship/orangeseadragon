"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { archivePageConfig } from "@/config/pages/archive";

interface ArchivedItem {
  id: string;
  name: string;
  type: "event" | "contact" | "vendor" | "invoice" | "document";
  archived_at: string;
  archived_by: string;
  original_created_at: string;
}

export default function ArchivePage() {
  const [archiveData, setArchiveData] = React.useState<ArchivedItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchArchiveData() {
      try {
        const response = await fetch("/api/v1/archive");
        if (response.ok) {
          const result = await response.json();
          setArchiveData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch archive data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArchiveData();
  }, []);

  const stats = React.useMemo(() => {
    const eventCount = archiveData.filter((i) => i.type === "event").length;
    const contactCount = archiveData.filter((i) => i.type === "contact").length;
    const vendorCount = archiveData.filter((i) => i.type === "vendor").length;
    const documentCount = archiveData.filter((i) => i.type === "document" || i.type === "invoice").length;

    return [
      { id: "total", label: "Total Archived", value: archiveData.length },
      { id: "events", label: "Events", value: eventCount },
      { id: "contacts", label: "Contacts", value: contactCount },
      { id: "vendorsDocs", label: "Vendors & Docs", value: vendorCount + documentCount },
    ];
  }, [archiveData]);

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
      config={archivePageConfig}
      data={archiveData}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["name", "archived_by"]}
      onAction={handleAction}
    />
  );
}
