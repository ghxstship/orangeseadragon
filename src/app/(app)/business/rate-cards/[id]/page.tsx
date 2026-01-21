"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Calendar, Users, Clock, Plus, Loader2 } from "lucide-react";
import { EntityDetailPage } from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency as formatCurrencyUtil, DEFAULT_CURRENCY } from "@/lib/config";

interface RateCardItem {
  id: string;
  role: string;
  hourly_rate: number;
  daily_rate: number;
  overtime_multiplier: number;
}

interface RateCard {
  id: string;
  name: string;
  description?: string;
  effective_date?: string;
  expiry_date?: string;
  status: string;
  client_type?: string;
  currency?: string;
  notes?: string;
  items?: RateCardItem[];
  usage_count?: number;
  last_used?: string;
  created_at?: string;
  created_by?: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  expired: { label: "Expired", variant: "outline" },
};

const clientTypeConfig: Record<string, { label: string; className: string }> = {
  standard: { label: "Standard", className: "bg-blue-500 text-white" },
  premium: { label: "Premium", className: "bg-purple-500 text-white" },
  enterprise: { label: "Enterprise", className: "bg-orange-500 text-white" },
};

function formatCurrency(amount: number): string {
  return formatCurrencyUtil(amount, DEFAULT_CURRENCY);
}

export default function RateCardDetailPage() {
  const params = useParams();
  const rateCardId = params.id as string;
  const [rateCard, setRateCard] = React.useState<RateCard | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchRateCard() {
      try {
        const response = await fetch(`/api/v1/rate-cards/${rateCardId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch rate card");
        }
        const result = await response.json();
        setRateCard(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchRateCard();
  }, [rateCardId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !rateCard) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-2">
        <p className="text-destructive">{error || "Rate card not found"}</p>
      </div>
    );
  }

  const status = statusConfig[rateCard.status] || statusConfig.draft;
  const clientType = clientTypeConfig[rateCard.client_type || "standard"] || clientTypeConfig.standard;
  const items = rateCard.items || [];

  const avgHourlyRate = items.length > 0 ? items.reduce((sum, i) => sum + i.hourly_rate, 0) / items.length : 0;
  const avgDailyRate = items.length > 0 ? items.reduce((sum, i) => sum + i.daily_rate, 0) / items.length : 0;

  const breadcrumbs = [
    { label: "Rate Cards", href: "/rate-cards" },
    { label: rateCard.name },
  ];

  const tabs = [
    {
      id: "rates",
      label: "Rates",
      badge: items.length,
      content: (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Role Rates</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Role
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-sm">
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-right p-3 font-medium">Hourly Rate</th>
                    <th className="text-right p-3 font-medium">Daily Rate</th>
                    <th className="text-right p-3 font-medium">OT Multiplier</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? items.map((item: RateCardItem) => (
                    <tr key={item.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {item.role}
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(item.hourly_rate)}/hr
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatCurrency(item.daily_rate)}/day
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {item.overtime_multiplier}x
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-muted-foreground">No rates defined</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "usage",
      label: "Usage",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Usage History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Times Used</p>
                  <p className="text-2xl font-bold">{rateCard.usage_count || 0}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Last Used</p>
                  <p className="text-2xl font-bold">{rateCard.last_used ? new Date(rateCard.last_used).toLocaleDateString() : "Never"}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Detailed usage history would be displayed here, showing which events/projects used this rate card.
              </p>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{rateCard.notes || "No notes"}</p>
          </CardContent>
        </Card>
      ),
    },
  ];

  const sidebarContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Client Type</span>
            <Badge className={clientType.className}>{clientType.label}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Currency</span>
            <span className="text-sm font-medium">{rateCard.currency || "USD"}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Validity Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Effective From</p>
              <p className="text-sm">{rateCard.effective_date ? new Date(rateCard.effective_date).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
          {rateCard.expiry_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Expires On</p>
                <p className="text-sm">{new Date(rateCard.expiry_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Averages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Hourly</span>
            <span className="text-sm font-medium">{formatCurrency(avgHourlyRate)}/hr</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Daily</span>
            <span className="text-sm font-medium">{formatCurrency(avgDailyRate)}/day</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EntityDetailPage
      title={rateCard.name}
      subtitle={rateCard.description || "Rate Card"}
      status={{ label: status.label, variant: status.variant }}
      breadcrumbs={breadcrumbs}
      backHref="/rate-cards"
      editHref={`/rate-cards/${rateCardId}/edit`}
      onDelete={() => console.log("Delete rate card")}
      tabs={tabs}
      defaultTab="rates"
      sidebarContent={sidebarContent}
      actions={[
        { id: "duplicate", label: "Duplicate", onClick: () => console.log("Duplicate") },
        { id: "export", label: "Export", onClick: () => console.log("Export") },
        { id: "activate", label: "Activate", onClick: () => console.log("Activate") },
      ]}
    />
  );
}
