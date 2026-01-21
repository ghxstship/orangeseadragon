"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { domainSettingsPageConfig } from "@/config/pages/domain-settings";

interface Domain {
  id: string;
  domain: string;
  type: "primary" | "alias" | "custom";
  status: "verified" | "pending" | "failed";
  ssl_status: "active" | "pending" | "expired";
  added_at: string;
  verified_at?: string;
}

export default function DomainSettingsPage() {
  const [domainsData, setDomainsData] = React.useState<Domain[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDomains() {
      try {
        const response = await fetch("/api/v1/domain-settings");
        if (response.ok) {
          const result = await response.json();
          setDomainsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch domains:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDomains();
  }, []);

  const stats = React.useMemo(() => {
    const verifiedCount = domainsData.filter((d) => d.status === "verified").length;
    const pendingCount = domainsData.filter((d) => d.status === "pending").length;
    const sslCount = domainsData.filter((d) => d.ssl_status === "active").length;

    return [
      { id: "total", label: "Total Domains", value: domainsData.length },
      { id: "verified", label: "Verified", value: verifiedCount },
      { id: "pending", label: "Pending", value: pendingCount },
      { id: "ssl", label: "SSL Certificates", value: sslCount },
    ];
  }, [domainsData]);

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
    <DataViewPage<Domain>
      config={domainSettingsPageConfig}
      data={domainsData}
      stats={stats}
      getRowId={(d) => d.id}
      searchFields={["domain"]}
      onAction={handleAction}
    />
  );
}
