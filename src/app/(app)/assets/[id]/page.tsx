"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { MapPin, Wrench, Calendar, Loader2 } from "lucide-react";
import { EntityDetailPage } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface Asset {
  id: string;
  name: string;
  asset_tag?: string;
  category?: string;
  status: string;
  condition?: string;
  location?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_value?: number;
  warranty_expires?: string;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
  assigned_to?: { id: string; name: string };
  metadata?: Record<string, unknown>;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  available: { label: "Available", variant: "default" },
  in_use: { label: "In Use", variant: "secondary" },
  maintenance: { label: "Maintenance", variant: "outline" },
  reserved: { label: "Reserved", variant: "outline" },
  retired: { label: "Retired", variant: "secondary" },
};

const conditionConfig: Record<string, { label: string; percent: number }> = {
  excellent: { label: "Excellent", percent: 100 },
  good: { label: "Good", percent: 75 },
  fair: { label: "Fair", percent: 50 },
  poor: { label: "Poor", percent: 25 },
};

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.id as string;
  const [asset, setAsset] = React.useState<Asset | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchAsset() {
      try {
        const response = await fetch(`/api/v1/assets/${assetId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch asset");
        }
        const result = await response.json();
        setAsset(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchAsset();
  }, [assetId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <p className="text-destructive">{error || "Asset not found"}</p>
      </div>
    );
  }

  const status = statusConfig[asset.status] || statusConfig.available;
  const condition = conditionConfig[asset.condition || "good"] || conditionConfig.good;
  const purchasePrice = asset.purchase_price || 0;
  const currentValue = asset.current_value || 0;
  const depreciationPercent = purchasePrice > 0 ? Math.round((currentValue / purchasePrice) * 100) : 0;
  const maintenanceHistory = (asset.metadata?.maintenance_history as Array<{ id: string; date: string; type: string; notes: string }>) || [];
  const usageHistory = (asset.metadata?.usage_history as Array<{ id: string; project: string; dates: string; status: string }>) || [];
  const lastMaintenance = (asset.metadata?.last_maintenance as string) || "";
  const nextMaintenance = (asset.metadata?.next_maintenance as string) || "";

  const breadcrumbs = [
    { label: "Assets", href: "/assets" },
    ...(asset.category ? [{ label: asset.category, href: `/assets?category=${asset.category}` }] : []),
    { label: asset.name },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">{asset.manufacturer || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-medium">{asset.model || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Serial Number</p>
                  <p className="font-medium font-mono">{asset.serial_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asset Tag</p>
                  <p className="font-medium font-mono">{asset.asset_tag || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Condition & Value</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Condition: {condition.label}</span>
                  <span>{condition.percent}%</span>
                </div>
                <Progress value={condition.percent} />
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Price</p>
                  <p className="text-lg font-semibold">${purchasePrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-lg font-semibold">${currentValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Depreciation</p>
                  <p className="text-lg font-semibold">{100 - depreciationPercent}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "maintenance",
      label: "Maintenance",
      badge: maintenanceHistory.length,
      content: (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceHistory.length > 0 ? maintenanceHistory.map((record: { id: string; date: string; type: string; notes: string }) => (
                <div key={record.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{record.type}</span>
                      <span className="text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{record.notes}</p>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground">No maintenance history</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "usage",
      label: "Usage History",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Usage History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageHistory.length > 0 ? usageHistory.map((usage: { id: string; project: string; dates: string; status: string }) => (
                <div key={usage.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{usage.project}</p>
                    <p className="text-sm text-muted-foreground">{usage.dates}</p>
                  </div>
                  <Badge variant={usage.status === "current" ? "default" : "secondary"}>
                    {usage.status}
                  </Badge>
                </div>
              )) : (
                <p className="text-muted-foreground">No usage history</p>
              )}
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  const sidebarContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Condition</span>
            <Badge variant="outline">{condition.label}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm">{asset.location || "Not specified"}</span>
          </div>
          {asset.assigned_to && (
            <div className="mt-3 p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">Assigned to</p>
              <p className="text-sm font-medium">{asset.assigned_to.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Important Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Purchase Date</p>
            <p className="text-sm">{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Warranty Expires</p>
            <p className="text-sm">{asset.warranty_expires ? new Date(asset.warranty_expires).toLocaleDateString() : "N/A"}</p>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground">Last Maintenance</p>
            <p className="text-sm">{lastMaintenance ? new Date(lastMaintenance).toLocaleDateString() : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Next Maintenance</p>
            <p className="text-sm font-medium text-orange-600">{nextMaintenance ? new Date(nextMaintenance).toLocaleDateString() : "N/A"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EntityDetailPage
      title={asset.name}
      subtitle={`${asset.category || "Asset"} • ${asset.asset_tag || asset.id}`}
      status={{ label: status.label, variant: status.variant }}
      breadcrumbs={breadcrumbs}
      backHref="/assets"
      editHref={`/assets/${assetId}/edit`}
      onDelete={() => console.log("Delete asset")}
      tabs={tabs}
      defaultTab="overview"
      sidebarContent={sidebarContent}
      actions={[
        { id: "checkout", label: "Check Out", onClick: () => console.log("Check out") },
        { id: "maintenance", label: "Schedule Maintenance", onClick: () => console.log("Maintenance") },
        { id: "qrcode", label: "Print QR Code", onClick: () => console.log("QR Code") },
      ]}
    />
  );
}
