"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { vendorsPageConfig } from "@/config/pages/vendors";

interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_name: string;
  email: string;
  phone: string;
  location: string;
  rating: number;
  status: "active" | "inactive" | "pending";
  total_spend: number;
  projects_count: number;
  tags: string[];
}

export default function VendorsPage() {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchVendors() {
      try {
        const response = await fetch("/api/v1/companies?type=vendor");
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
    const totalSpend = vendors.reduce((acc, v) => acc + (v.total_spend || 0), 0);
    const avgRating = vendors.length > 0 ? (vendors.reduce((acc, v) => acc + (v.rating || 0), 0) / vendors.length).toFixed(1) : "0";
    return [
      { id: "total", label: "Total Vendors", value: vendors.length },
      { id: "active", label: "Active Vendors", value: vendors.filter((v) => v.status === "active").length },
      { id: "spend", label: "Total Spend", value: `$${(totalSpend / 1000).toFixed(0)}K` },
      { id: "rating", label: "Avg. Rating", value: avgRating },
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
      config={vendorsPageConfig}
      data={vendors}
      stats={stats}
      getRowId={(v) => v.id}
      searchFields={["name", "category", "contact_name"]}
      onAction={handleAction}
    />
  );
}
