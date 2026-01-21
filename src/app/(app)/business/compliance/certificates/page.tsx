"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { certificatesPageConfig } from "@/config/pages/certificates";

interface Certificate {
  id: string;
  name: string;
  domain: string;
  issuer: string;
  type: "ssl" | "code_signing" | "client";
  status: "valid" | "expiring" | "expired";
  issued_at: string;
  expires_at: string;
  days_remaining: number;
}

export default function CertificatesPage() {
  const [certificatesData, setCertificatesData] = React.useState<Certificate[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCertificates() {
      try {
        const response = await fetch("/api/v1/certificates");
        if (response.ok) {
          const result = await response.json();
          setCertificatesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCertificates();
  }, []);

  const stats = React.useMemo(() => {
    const validCount = certificatesData.filter((c) => c.status === "valid").length;
    const expiringCount = certificatesData.filter((c) => c.status === "expiring").length;

    return [
      { id: "total", label: "Total Certificates", value: certificatesData.length },
      { id: "valid", label: "Valid", value: validCount },
      { id: "expiring", label: "Expiring Soon", value: expiringCount },
      { id: "autoRenewal", label: "Auto-Renewal", value: "Enabled" },
    ];
  }, [certificatesData]);

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
    <DataViewPage<Certificate>
      config={certificatesPageConfig}
      data={certificatesData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["name", "domain", "issuer"]}
      onAction={handleAction}
    />
  );
}
