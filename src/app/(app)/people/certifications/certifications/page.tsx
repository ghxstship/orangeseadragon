"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { certificationsPageConfig } from "@/config/pages/certifications";

interface Certification {
  id: string;
  employee_name: string;
  employee_id: string;
  certification_name: string;
  certification_body: string;
  issue_date: string;
  expiry_date: string;
  status: "active" | "expiring_soon" | "expired" | "pending";
  document_url?: string;
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = React.useState<Certification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCertifications() {
      try {
        const response = await fetch("/api/v1/certifications");
        if (response.ok) {
          const result = await response.json();
          setCertifications(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch certifications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCertifications();
  }, []);

  const stats = React.useMemo(() => {
    const active = certifications.filter((c) => c.status === "active").length;
    const expiringSoon = certifications.filter((c) => c.status === "expiring_soon").length;
    const expired = certifications.filter((c) => c.status === "expired").length;
    return [
      { id: "total", label: "Total Certifications", value: certifications.length },
      { id: "active", label: "Active", value: active },
      { id: "expiring", label: "Expiring Soon", value: expiringSoon },
      { id: "expired", label: "Expired", value: expired },
    ];
  }, [certifications]);

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
    <DataViewPage<Certification>
      config={certificationsPageConfig}
      data={certifications}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["employee_name", "certification_name", "certification_body"]}
      onAction={handleAction}
    />
  );
}
