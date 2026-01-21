"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { loginsPageConfig } from "@/config/pages/logins";

interface Login {
  id: string;
  device: string;
  location: string;
  ip: string;
  time: string;
  current: boolean;
}

export default function AccountHistoryLoginsPage() {
  const [loginsData, setLoginsData] = React.useState<Login[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLogins() {
      try {
        const response = await fetch("/api/v1/account/history/logins");
        if (response.ok) {
          const result = await response.json();
          setLoginsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch logins:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogins();
  }, []);

  const stats = React.useMemo(() => {
    const activeCount = loginsData.filter((l) => l.current).length;
    const uniqueLocations = new Set(loginsData.map((l) => l.location)).size;
    return [
      { id: "total", label: "Total Sessions", value: loginsData.length },
      { id: "active", label: "Active Sessions", value: activeCount },
      { id: "locations", label: "Locations", value: uniqueLocations },
    ];
  }, [loginsData]);

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
    <DataViewPage<Login>
      config={loginsPageConfig}
      data={loginsData}
      stats={stats}
      getRowId={(l) => l.id}
      searchFields={["device", "location"]}
      onAction={handleAction}
    />
  );
}
