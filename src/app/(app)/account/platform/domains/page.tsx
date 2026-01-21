"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { domainsPageConfig } from "@/config/pages/domains";

interface Domain {
  id: string;
  domain: string;
  type: string;
  status: "verified" | "pending";
  ssl: boolean;
}

export default function AccountPlatformDomainsPage() {
  const [domainsData, setDomainsData] = React.useState<Domain[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDomains() {
      try {
        const response = await fetch("/api/v1/account/platform/domains");
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
    const sslCount = domainsData.filter((d) => d.ssl).length;
    return [
      { id: "total", label: "Total Domains", value: domainsData.length },
      { id: "verified", label: "Verified", value: verifiedCount },
      { id: "ssl", label: "SSL Enabled", value: sslCount },
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
      config={domainsPageConfig}
      data={domainsData}
      stats={stats}
      getRowId={(d) => d.id}
      searchFields={["domain"]}
      onAction={handleAction}
    />
  );
}
