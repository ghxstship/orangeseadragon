"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { trashPageConfig } from "@/config/pages/trash";

interface TrashedItem {
  id: string;
  name: string;
  type: "document" | "event" | "project" | "contact" | "note" | "template";
  originalLocation: string;
  deletedDate: string;
  deletedBy: string;
  expiresIn: number;
  size?: string;
}

export default function TrashPage() {
  const [trashData, setTrashData] = React.useState<TrashedItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTrash() {
      try {
        const response = await fetch("/api/v1/trash");
        if (response.ok) {
          const result = await response.json();
          setTrashData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch trash:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrash();
  }, []);

  const stats = React.useMemo(() => {
    const expiringCount = trashData.filter((i) => i.expiresIn <= 7).length;

    return [
      { id: "total", label: "Items in Trash", value: trashData.length },
      { id: "expiring", label: "Expiring Soon", value: expiringCount },
    ];
  }, [trashData]);

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
    <DataViewPage<TrashedItem>
      config={trashPageConfig}
      data={trashData}
      stats={stats}
      getRowId={(i) => i.id}
      searchFields={["name", "originalLocation", "deletedBy"]}
      onAction={handleAction}
    />
  );
}
