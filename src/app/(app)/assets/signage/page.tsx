"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { signagePageConfig } from "@/config/pages/signage";

interface SignageItem {
  id: string;
  name: string;
  type: "directional" | "informational" | "branding" | "safety" | "sponsor";
  location: string;
  eventName: string;
  size: string;
  quantity: number;
  status: "design" | "approved" | "printing" | "installed" | "removed";
  dueDate: string;
  notes?: string;
}

export default function SignagePage() {
  const [signageData, setSignageData] = React.useState<SignageItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSignage() {
      try {
        const response = await fetch("/api/v1/signage");
        if (response.ok) {
          const result = await response.json();
          setSignageData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch signage:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSignage();
  }, []);

  const stats = React.useMemo(() => {
    const totalQuantity = signageData.reduce((acc, s) => acc + (s.quantity || 0), 0);
    const installedCount = signageData.filter((s) => s.status === "installed").length;
    const pendingCount = signageData.filter((s) => s.status === "design" || s.status === "approved" || s.status === "printing").length;

    return [
      { id: "total", label: "Total Items", value: signageData.length },
      { id: "quantity", label: "Total Quantity", value: totalQuantity },
      { id: "installed", label: "Installed", value: installedCount },
      { id: "pending", label: "Pending", value: pendingCount },
    ];
  }, [signageData]);

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
    <DataViewPage<SignageItem>
      config={signagePageConfig}
      data={signageData}
      stats={stats}
      getRowId={(s) => s.id}
      searchFields={["name", "location", "eventName"]}
      onAction={handleAction}
    />
  );
}
