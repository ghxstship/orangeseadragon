"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { affiliatesPageConfig } from "@/config/pages/affiliates";
import { useRouter } from "next/navigation";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  status: "active" | "pending" | "inactive";
  referrals: number;
  earnings: number;
  conversion_rate: number;
  joined_at: string;
}

export default function AffiliatesPage() {
  const router = useRouter();
  const [affiliates, setAffiliates] = React.useState<Affiliate[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAffiliates() {
      try {
        const response = await fetch("/api/v1/affiliates");
        if (response.ok) {
          const result = await response.json();
          setAffiliates(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch affiliates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAffiliates();
  }, []);

  const stats = React.useMemo(() => {
    const activeCount = affiliates.filter((a) => a.status === "active").length;
    const totalReferrals = affiliates.reduce((acc, a) => acc + (a.referrals || 0), 0);
    const totalEarnings = affiliates.reduce((acc, a) => acc + (a.earnings || 0), 0);

    return [
      { id: "total", label: "Total Affiliates", value: affiliates.length },
      { id: "active", label: "Active", value: activeCount },
      { id: "referrals", label: "Total Referrals", value: totalReferrals },
      { id: "earnings", label: "Total Earnings", value: totalEarnings, format: "currency" as const },
    ];
  }, [affiliates]);

  const handleAction = React.useCallback(
    (actionId: string, payload?: unknown) => {
      switch (actionId) {
        case "create":
          console.log("Create new affiliate");
          break;
        case "view":
          console.log("View affiliate details", payload);
          break;
        case "referrals":
          console.log("View referrals", payload);
          break;
        case "payout":
          console.log("Process payout", payload);
          break;
        case "toggle-status":
          console.log("Toggle status", payload);
          break;
        case "delete":
          console.log("Delete affiliate", payload);
          break;
        case "activate":
        case "deactivate":
          console.log("Bulk action:", actionId, payload);
          break;
        default:
          console.log("Unknown action:", actionId, payload);
      }
    },
    []
  );

  const handleRowClick = React.useCallback(
    (affiliate: Affiliate) => {
      router.push(`/affiliates/${affiliate.id}`);
    },
    [router]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<Affiliate>
      config={affiliatesPageConfig}
      data={affiliates}
      stats={stats}
      getRowId={(affiliate) => affiliate.id}
      searchFields={["name", "email"]}
      onAction={handleAction}
      onRowClick={handleRowClick}
    />
  );
}
