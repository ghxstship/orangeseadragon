"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { callSheetsPageConfig } from "@/config/pages/call-sheets";
import { CALL_SHEET_STATUS, type CallSheetStatus } from "@/lib/enums";

interface CallSheetSection {
  title: string;
  time: string;
  details: string;
}

interface CallSheet {
  id: string;
  event_name: string;
  event_date: string;
  venue: string;
  call_time: string;
  status: CallSheetStatus;
  recipient_count: number;
  acknowledged_count: number;
  sections: CallSheetSection[];
  last_updated: string;
}

export default function CallSheetsPage() {
  const [callSheetsData, setCallSheetsData] = React.useState<CallSheet[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCallSheets() {
      try {
        const response = await fetch("/api/v1/call-sheets");
        if (response.ok) {
          const result = await response.json();
          setCallSheetsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch call sheets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCallSheets();
  }, []);

  const stats = React.useMemo(() => {
    const sent = callSheetsData.filter((c) => c.status === CALL_SHEET_STATUS.SENT || c.status === CALL_SHEET_STATUS.ACKNOWLEDGED).length;
    const pendingAck = callSheetsData.filter((c) => c.status === CALL_SHEET_STATUS.SENT).reduce((acc, c) => acc + ((c.recipient_count || 0) - (c.acknowledged_count || 0)), 0);
    const drafts = callSheetsData.filter((c) => c.status === CALL_SHEET_STATUS.DRAFT).length;

    return [
      { id: "total", label: "Total Call Sheets", value: callSheetsData.length },
      { id: "sent", label: "Sent", value: sent },
      { id: "pending", label: "Pending Acknowledgment", value: pendingAck },
      { id: "drafts", label: "Drafts", value: drafts },
    ];
  }, [callSheetsData]);

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
    <DataViewPage<CallSheet>
      config={callSheetsPageConfig}
      data={callSheetsData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["event_name", "venue"]}
      onAction={handleAction}
    />
  );
}
