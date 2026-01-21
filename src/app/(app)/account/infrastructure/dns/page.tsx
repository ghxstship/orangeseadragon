"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dnsManagementPageConfig } from "@/config/pages/dns-management";

interface DNSRecord {
  id: string;
  name: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS";
  value: string;
  ttl: number;
  status: "active" | "pending" | "error";
}

export default function DNSManagementPage() {
  const [dnsRecordsData, setDnsRecordsData] = React.useState<DNSRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDnsRecords() {
      try {
        const response = await fetch("/api/v1/dns-management");
        if (response.ok) {
          const result = await response.json();
          setDnsRecordsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch DNS records:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDnsRecords();
  }, []);

  const stats = React.useMemo(() => {
    const recordTypes = Array.from(new Set(dnsRecordsData.map((r) => r.type)));
    const activeRecords = dnsRecordsData.filter((r) => r.status === "active").length;

    return [
      { id: "total", label: "Total Records", value: dnsRecordsData.length },
      { id: "active", label: "Active", value: activeRecords },
      { id: "types", label: "Record Types", value: recordTypes.length },
      { id: "status", label: "DNS Status", value: "Propagated" },
    ];
  }, [dnsRecordsData]);

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
    <DataViewPage<DNSRecord>
      config={dnsManagementPageConfig}
      data={dnsRecordsData}
      stats={stats}
      getRowId={(r) => r.id}
      searchFields={["name", "value"]}
      onAction={handleAction}
    />
  );
}
