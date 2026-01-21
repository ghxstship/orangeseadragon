"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { emailCampaignsPageConfig } from "@/config/pages/email-campaigns";
import { EMAIL_CAMPAIGN_STATUS, type EmailCampaignStatus, type EmailCampaignType } from "@/lib/enums";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  event_name: string;
  type: EmailCampaignType;
  status: EmailCampaignStatus;
  scheduled_date?: string;
  scheduled_time?: string;
  sent_date?: string;
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
  created_by: string;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

function calculateRate(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

export default function EmailCampaignsPage() {
  const [emailCampaignsData, setEmailCampaignsData] = React.useState<EmailCampaign[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchEmailCampaigns() {
      try {
        const response = await fetch("/api/v1/email-campaigns");
        if (response.ok) {
          const result = await response.json();
          setEmailCampaignsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch email campaigns:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmailCampaigns();
  }, []);

  const stats = React.useMemo(() => {
    const totalSent = emailCampaignsData.filter((c) => c.status === EMAIL_CAMPAIGN_STATUS.SENT).reduce((acc, c) => acc + (c.delivered || 0), 0);
    const totalOpened = emailCampaignsData.reduce((acc, c) => acc + (c.opened || 0), 0);
    const avgOpenRate = calculateRate(totalOpened, totalSent);
    const scheduled = emailCampaignsData.filter((c) => c.status === EMAIL_CAMPAIGN_STATUS.SCHEDULED).length;

    return [
      { id: "total", label: "Total Campaigns", value: emailCampaignsData.length },
      { id: "delivered", label: "Emails Delivered", value: formatNumber(totalSent) },
      { id: "openRate", label: "Avg Open Rate", value: `${avgOpenRate}%` },
      { id: "scheduled", label: "Scheduled", value: scheduled },
    ];
  }, [emailCampaignsData]);

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
    <DataViewPage<EmailCampaign>
      config={emailCampaignsPageConfig}
      data={emailCampaignsData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["name", "subject", "event_name"]}
      onAction={handleAction}
    />
  );
}
