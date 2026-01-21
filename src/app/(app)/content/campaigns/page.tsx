"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { campaignsPageConfig } from "@/config/pages/campaigns";
import { CAMPAIGN_STATUS, type CampaignStatus, type CampaignType } from "@/lib/enums";

interface Campaign {
  id: string;
  name: string;
  event: string;
  type: CampaignType;
  status: CampaignStatus;
  start_date: string;
  end_date: string;
  budget?: number;
  spent?: number;
  metrics: {
    reach?: number;
    engagement?: number;
    conversions?: number;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await fetch("/api/v1/campaigns");
        if (response.ok) {
          const result = await response.json();
          setCampaigns(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const stats = React.useMemo(() => {
    const activeCampaigns = campaigns.filter((c) => c.status === CAMPAIGN_STATUS.ACTIVE).length;
    const totalReach = campaigns.reduce((acc, c) => acc + (c.metrics?.reach || 0), 0);
    const totalConversions = campaigns.reduce((acc, c) => acc + (c.metrics?.conversions || 0), 0);
    return [
      { id: "total", label: "Total Campaigns", value: campaigns.length },
      { id: "active", label: "Active", value: activeCampaigns },
      { id: "reach", label: "Total Reach", value: totalReach },
      { id: "conversions", label: "Conversions", value: totalConversions },
    ];
  }, [campaigns]);

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
    <DataViewPage<Campaign>
      config={campaignsPageConfig}
      data={campaigns}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["name", "event"]}
      onAction={handleAction}
    />
  );
}
