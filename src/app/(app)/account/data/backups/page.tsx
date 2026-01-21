"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { backupsPageConfig } from "@/config/pages/backups";

interface Backup {
  id: string;
  name: string;
  type: "full" | "incremental" | "differential";
  status: "completed" | "in_progress" | "failed" | "scheduled";
  created_at: string;
  completed_at?: string;
  size: string;
  retention: string;
  encrypted: boolean;
  location: "local" | "cloud" | "offsite";
}

export default function BackupsPage() {
  const [backupsData, setBackupsData] = React.useState<Backup[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBackups() {
      try {
        const response = await fetch("/api/v1/backups");
        if (response.ok) {
          const result = await response.json();
          setBackupsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch backups:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBackups();
  }, []);

  const stats = React.useMemo(() => {
    const completedBackups = backupsData.filter((b) => b.status === "completed").length;

    return [
      { id: "total", label: "Total Backups", value: backupsData.length },
      { id: "completed", label: "Completed", value: completedBackups },
      { id: "totalSize", label: "Total Storage", value: "150.0 GB" },
      { id: "lastBackup", label: "Last Backup", value: backupsData.length > 0 ? "Recent" : "N/A" },
    ];
  }, [backupsData]);

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
    <DataViewPage<Backup>
      config={backupsPageConfig}
      data={backupsData}
      stats={stats}
      getRowId={(b) => b.id}
      searchFields={["name"]}
      onAction={handleAction}
    />
  );
}
