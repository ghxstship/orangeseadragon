"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { accreditationPageConfig } from "@/config/pages/accreditation";

interface Credential {
  id: string;
  badge_number: string;
  holder_name: string;
  holder_email: string;
  organization: string;
  credential_type: "artist" | "crew" | "vendor" | "media" | "vip" | "staff";
  access_zones: string[];
  event_name: string;
  valid_from: string;
  valid_to: string;
  status: "pending" | "approved" | "printed" | "collected" | "revoked";
  photo_uploaded: boolean;
}

export default function AccreditationPage() {
  const [credentials, setCredentials] = React.useState<Credential[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCredentials() {
      try {
        const response = await fetch("/api/v1/accreditation");
        if (response.ok) {
          const result = await response.json();
          setCredentials(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch credentials:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCredentials();
  }, []);

  const stats = React.useMemo(() => {
    const pendingCount = credentials.filter((c) => c.status === "pending").length;
    const approvedCount = credentials.filter((c) => c.status === "approved" || c.status === "printed").length;
    const collectedCount = credentials.filter((c) => c.status === "collected").length;
    return [
      { id: "total", label: "Total Credentials", value: credentials.length },
      { id: "pending", label: "Pending Approval", value: pendingCount },
      { id: "ready", label: "Ready to Print", value: approvedCount },
      { id: "collected", label: "Collected", value: collectedCount },
    ];
  }, [credentials]);

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
    <DataViewPage<Credential>
      config={accreditationPageConfig}
      data={credentials}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["badge_number", "holder_name", "organization"]}
      onAction={handleAction}
    />
  );
}
