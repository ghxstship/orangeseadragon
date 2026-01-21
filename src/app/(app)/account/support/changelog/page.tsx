"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { changelogPageConfig } from "@/config/pages/changelog";

interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  changes: Change[];
}

interface Change {
  type: "feature" | "improvement" | "bugfix" | "security" | "breaking";
  description: string;
}

export default function ChangelogPage() {
  const [changelogData, setChangelogData] = React.useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchChangelog() {
      try {
        const response = await fetch("/api/v1/changelog");
        if (response.ok) {
          const result = await response.json();
          setChangelogData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch changelog:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChangelog();
  }, []);

  const stats = React.useMemo(() => {
    return [
      { id: "total", label: "Total Releases", value: changelogData.length },
      { id: "latest", label: "Latest Version", value: `v${changelogData[0]?.version || "N/A"}` },
    ];
  }, [changelogData]);

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
    <DataViewPage<ChangelogEntry>
      config={changelogPageConfig}
      data={changelogData}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["version", "title"]}
      onAction={handleAction}
    />
  );
}
