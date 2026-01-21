"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { journalEntriesPageConfig } from "@/config/pages/journal-entries";

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  type: string;
  status: string;
  debitTotal: number;
  creditTotal: number;
  createdBy: string;
  lineItems: number;
}

export default function JournalEntriesPage() {
  const [entriesData, setEntriesData] = React.useState<JournalEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchEntries() {
      try {
        const response = await fetch("/api/v1/journal-entries");
        if (response.ok) {
          const result = await response.json();
          setEntriesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch journal entries:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  const stats = React.useMemo(() => {
    const postedCount = entriesData.filter((e) => e.status === "posted").length;
    const pendingCount = entriesData.filter((e) => e.status === "pending" || e.status === "draft").length;
    const postedTotal = entriesData.filter((e) => e.status === "posted").reduce((acc, e) => acc + (e.debitTotal || 0), 0);
    return [
      { id: "total", label: "Total Entries", value: entriesData.length },
      { id: "posted", label: "Posted", value: postedCount },
      { id: "pending", label: "Pending Review", value: pendingCount },
      { id: "postedTotal", label: "Posted Total", value: postedTotal, format: "currency" as const },
    ];
  }, [entriesData]);

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
    <DataViewPage<JournalEntry>
      config={journalEntriesPageConfig}
      data={entriesData}
      stats={stats}
      getRowId={(e) => e.id}
      searchFields={["entryNumber", "description"]}
      onAction={handleAction}
    />
  );
}
