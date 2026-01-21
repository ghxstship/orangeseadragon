"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { supportTicketsPageConfig } from "@/config/pages/support-tickets";

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  created_at: string;
}

export default function AccountSupportTicketsPage() {
  const [ticketsData, setTicketsData] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await fetch("/api/v1/account/support/tickets");
        if (response.ok) {
          const result = await response.json();
          setTicketsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const stats = React.useMemo(() => {
    const openCount = ticketsData.filter((t) => t.status === "open").length;
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
    <DataViewPage<Ticket>
      config={supportTicketsPageConfig}
      data={ticketsData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["id", "subject"]}
      onAction={handleAction}
    />
  );
}
