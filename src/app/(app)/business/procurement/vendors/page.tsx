"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { procurementVendorsPageConfig } from "@/config/pages/procurement-vendors";

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  orders: number;
  status: string;
}

export default function ProcurementVendorsPage() {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchVendors() {
      try {
        const response = await fetch("/api/v1/business/procurement/vendors");
        if (response.ok) {
          const result = await response.json();
          setVendors(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  const stats = React.useMemo(() => {
    const approvedCount = vendors.filter((v) => v.status === "approved").length;
    const pendingCount = vendors.filter((v) => v.status === "pending").length;
    return [
      { id: "total", label: "Total Vendors", value: vendors.length },
      { id: "approved", label: "Approved", value: approvedCount },
      { id: "pending", label: "Pending", value: pendingCount },
    ];
  }, [vendors]);

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
    <DataViewPage<Vendor>
      config={procurementVendorsPageConfig}
      data={vendors}
      stats={stats}
      getRowId={(v) => v.id}
      searchFields={["name", "category"]}
      onAction={handleAction}
    />
  );
}
