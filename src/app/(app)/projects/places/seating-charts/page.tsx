"use client";

import * as React from "react";
import { Loader2, Plus, Search, Users, Calendar, MoreHorizontal, Eye, Edit, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataViewPage } from "@/components/common/data-view-page";
import { seatingChartsPageConfig } from "@/config/pages/seating-charts";

type SeatingChartStatus = "draft" | "in_progress" | "finalized" | "locked";

interface SeatingChart {
  id: string;
  name: string;
  event_name: string;
  venue: string;
  total_seats: number;
  assigned_seats: number;
  table_count: number;
  status: SeatingChartStatus;
  last_modified: string;
  vip_seats: number;
  dietary_notes: number;
}

const statusConfig: Record<SeatingChartStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-500" },
  in_progress: { label: "In Progress", color: "bg-blue-500" },
  finalized: { label: "Finalized", color: "bg-green-500" },
  locked: { label: "Locked", color: "bg-purple-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SeatingChartsPage() {
  const [seatingCharts, setSeatingCharts] = React.useState<SeatingChart[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSeatingCharts() {
      try {
        const response = await fetch("/api/v1/projects/places/seating-charts");
        if (response.ok) {
          const result = await response.json();
          setSeatingCharts(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch seating charts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSeatingCharts();
  }, []);

  const totalSeats = seatingCharts.reduce((acc: number, c: SeatingChart) => acc + c.total_seats, 0);
  const assignedSeats = seatingCharts.reduce((acc: number, c: SeatingChart) => acc + c.assigned_seats, 0);

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
    <DataViewPage<SeatingChart>
      config={seatingChartsPageConfig}
      data={chartsData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["name", "eventName", "venue"]}
      onAction={handleAction}
    />
  );
}
