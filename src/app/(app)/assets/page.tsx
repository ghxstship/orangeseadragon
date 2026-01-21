"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { assetsPageConfig } from "@/config/pages/assets";
import { useRouter } from "next/navigation";

type AssetStatus = "available" | "in_use" | "maintenance" | "reserved" | "retired" | "lost" | "damaged";
type AssetCondition = "excellent" | "good" | "fair" | "poor" | "broken";

interface Asset {
  id: string;
  name: string;
  asset_tag: string;
  category: string;
  status: AssetStatus;
  condition: AssetCondition;
  location: string;
  assigned_to: string | null;
  last_maintenance: string | null;
  purchase_price: number;
  current_value: number;
}

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await fetch("/api/v1/assets");
        if (response.ok) {
          const result = await response.json();
          setAssets(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch assets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAssets();
  }, []);

  const stats = React.useMemo(() => {
    const available = assets.filter((a) => a.status === "available").length;
    const inUse = assets.filter((a) => a.status === "in_use").length;
    const maintenance = assets.filter((a) => a.status === "maintenance").length;
    const totalValue = assets.reduce((sum, a) => sum + (a.current_value || 0), 0);

    return [
      { id: "total", label: "Total Assets", value: assets.length },
      { id: "available", label: "Available", value: available },
      { id: "inUse", label: "In Use / Maintenance", value: `${inUse} / ${maintenance}` },
      { id: "value", label: "Total Value", value: totalValue, format: "currency" as const },
    ];
  }, [assets]);

  const handleAction = React.useCallback(
    (actionId: string, payload?: unknown) => {
      switch (actionId) {
        case "create":
          console.log("Create new asset");
          break;
        case "view":
          console.log("View asset details", payload);
          break;
        case "checkout":
          console.log("Check out asset", payload);
          break;
        case "checkin":
          console.log("Check in asset", payload);
          break;
        case "maintenance":
          console.log("Schedule maintenance", payload);
          break;
        case "qrcode":
          console.log("Print QR code", payload);
          break;
        case "edit":
          console.log("Edit asset", payload);
          break;
        case "retire":
          console.log("Retire asset", payload);
          break;
        default:
          console.log("Unknown action:", actionId, payload);
      }
    },
    []
  );

  const handleRowClick = React.useCallback(
    (asset: Asset) => {
      router.push(`/assets/${asset.id}`);
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
    <DataViewPage<Asset>
      config={assetsPageConfig}
      data={assets}
      stats={stats}
      getRowId={(asset) => asset.id}
      searchFields={["name", "asset_tag", "category"]}
      onAction={handleAction}
      onRowClick={handleRowClick}
    />
  );
}
