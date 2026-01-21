"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { ticketsPageConfig } from "@/config/pages/tickets";

interface TicketType {
  id: string;
  event_name: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  sold: number;
  status: "on_sale" | "sold_out" | "paused" | "scheduled";
  sales_start: string;
  sales_end: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = React.useState<TicketType[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTickets() {
      try {
        const response = await fetch("/api/v1/tickets");
        if (response.ok) {
          const result = await response.json();
          setTickets(result.data || []);
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
    const totalRevenue = tickets.reduce((acc, t) => acc + (t.price || 0) * (t.sold || 0), 0);
    const totalSold = tickets.reduce((acc, t) => acc + (t.sold || 0), 0);
    const totalCapacity = tickets.reduce((acc, t) => acc + (t.quantity || 0), 0);
    const sellThrough = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
    return [
      { id: "revenue", label: "Total Revenue", value: `$${(totalRevenue / 1000).toFixed(0)}K` },
      { id: "sold", label: "Tickets Sold", value: totalSold.toLocaleString() },
      { id: "capacity", label: "Total Capacity", value: totalCapacity.toLocaleString() },
      { id: "rate", label: "Sell-Through Rate", value: `${sellThrough}%` },
    ];
  }, [tickets]);

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
    <DataViewPage<TicketType>
      config={ticketsPageConfig}
      data={tickets}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["name", "event_name"]}
      onAction={handleAction}
    />
  );
}
