"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { supportTicketsPageConfig } from "@/config/pages/support-tickets";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "waiting" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: number;
}

export default function SupportTicketsPage() {
  const [ticketsData, setTicketsData] = React.useState<SupportTicket[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await fetch("/api/v1/support-tickets");
        if (response.ok) {
          const result = await response.json();
          setTicketsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch support tickets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const stats = React.useMemo(() => {
    const openCount = ticketsData.filter((t) => t.status === "open" || t.status === "in_progress" || t.status === "waiting").length;
    const resolvedCount = ticketsData.filter((t) => t.status === "resolved").length;

    return [
      { id: "total", label: "Total Tickets", value: ticketsData.length },
      { id: "open", label: "Open", value: openCount },
      { id: "resolved", label: "Resolved", value: resolvedCount },
    ];
  }, [ticketsData]);

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
    <DataViewPage<SupportTicket>
      config={supportTicketsPageConfig}
      data={ticketsData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["id", "subject", "description"]}
      onAction={handleAction}
    />
  );
}
