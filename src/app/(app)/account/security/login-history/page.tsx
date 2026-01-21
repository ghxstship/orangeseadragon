"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { loginHistoryPageConfig } from "@/config/pages/login-history";

interface LoginRecord {
  id: string;
  user: string;
  email: string;
  status: "success" | "failed" | "blocked";
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  ip: string;
  location: string;
  timestamp: string;
  reason?: string;
}

export default function LoginHistoryPage() {
  const [loginHistoryData, setLoginHistoryData] = React.useState<LoginRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLoginHistory() {
      try {
        const response = await fetch("/api/v1/login-history");
        if (response.ok) {
          const result = await response.json();
          setLoginHistoryData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch login history:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLoginHistory();
  }, []);

  const stats = React.useMemo(() => {
    const successCount = loginHistoryData.filter((l) => l.status === "success").length;
    const failedCount = loginHistoryData.filter((l) => l.status === "failed").length;
    const blockedCount = loginHistoryData.filter((l) => l.status === "blocked").length;

    return [
      { id: "total", label: "Total Logins", value: loginHistoryData.length },
      { id: "success", label: "Successful", value: successCount },
      { id: "failed", label: "Failed", value: failedCount },
      { id: "blocked", label: "Blocked", value: blockedCount },
    ];
  }, [loginHistoryData]);

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
    <DataViewPage<LoginRecord>
      config={loginHistoryPageConfig}
      data={loginHistoryData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["user", "email", "ip", "location"]}
      onAction={handleAction}
    />
  );
}
