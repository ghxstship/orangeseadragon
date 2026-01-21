"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { changesPageConfig } from "@/config/pages/changes";

interface Change {
  id: string;
  field: string;
  old_value: string;
  new_value: string;
  changed_at: string;
  changed_by: string;
}

export default function AccountHistoryChangesPage() {
  const [changesData, setChangesData] = React.useState<Change[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchChanges() {
      try {
        const response = await fetch("/api/v1/account/history/changes");
        if (response.ok) {
          const result = await response.json();
          setChangesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch changes:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChanges();
  }, []);

  const stats = React.useMemo(() => {
    const uniqueUsers = new Set(changesData.map((c) => c.changed_by)).size;
    return [
      { id: "total", label: "Total Changes", value: changesData.length },
      { id: "users", label: "Users", value: uniqueUsers },
    ];
  }, [changesData]);

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
    <DataViewPage<Change>
      config={changesPageConfig}
      data={changesData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["field", "changed_by"]}
      onAction={handleAction}
    />
  );
}
