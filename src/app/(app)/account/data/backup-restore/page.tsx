"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { backupRestorePageConfig } from "@/config/pages/backup-restore";

interface Backup {
  id: string;
  name: string;
  type: "automatic" | "manual";
  size: string;
  created_at: string;
  status: "completed" | "in_progress" | "failed";
  retention: string;
}

export default function BackupRestorePage() {
  const [backups, setBackups] = React.useState<Backup[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBackups() {
      try {
        const response = await fetch("/api/v1/backup-restore");
        if (response.ok) {
          const result = await response.json();
          setBackups(result.data || []);
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
    const completedCount = backups.filter((b) => b.status === "completed").length;
    return [
      { id: "total", label: "Total Backups", value: backups.length },
      { id: "completed", label: "Completed", value: completedCount },
      { id: "storage", label: "Storage Used", value: "11.3 GB" },
      { id: "status", label: "Status", value: "Healthy" },
    ];
  }, [backups]);

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
      config={backupRestorePageConfig}
      data={backups}
      stats={stats}
      getRowId={(b) => b.id}
      searchFields={["name"]}
      onAction={handleAction}
    />
  );
}
