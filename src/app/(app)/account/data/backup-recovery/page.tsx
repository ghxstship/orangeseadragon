"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { backupRecoveryPageConfig } from "@/config/pages/backup-recovery";

interface Backup {
  id: string;
  name: string;
  type: "full" | "incremental" | "differential";
  status: "completed" | "in_progress" | "failed";
  size: string;
  created_at: string;
  duration: string;
  retention: string;
}

export default function BackupRecoveryPage() {
  const [backupRecoveryData, setBackupRecoveryData] = React.useState<Backup[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBackups() {
      try {
        const response = await fetch("/api/v1/backup-recovery");
        if (response.ok) {
          const result = await response.json();
          setBackupRecoveryData(result.data || []);
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
    const completedBackups = backupRecoveryData.filter((b) => b.status === "completed").length;

    return [
      { id: "total", label: "Total Backups", value: backupRecoveryData.length },
      { id: "completed", label: "Completed", value: completedBackups },
      { id: "totalSize", label: "Total Size", value: "95.1 GB" },
      { id: "lastBackup", label: "Last Backup", value: "2 hours ago" },
    ];
  }, [backupRecoveryData]);

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
      config={backupRecoveryPageConfig}
      data={backupRecoveryData}
      stats={stats}
      getRowId={(b) => b.id}
      searchFields={["name"]}
      onAction={handleAction}
    />
  );
}
