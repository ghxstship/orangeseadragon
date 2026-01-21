"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { smsTemplatesPageConfig } from "@/config/pages/sms-templates";
import { SMS_TEMPLATE_STATUS, type SmsTemplateStatus } from "@/lib/enums";

interface SmsTemplate {
  id: string;
  name: string;
  message: string;
  category: "alert" | "reminder" | "notification" | "marketing";
  status: SmsTemplateStatus;
  lastModified: string;
  usageCount: number;
  characterCount: number;
}

export default function SmsTemplatesPage() {
  const [templatesData, setTemplatesData] = React.useState<SmsTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch("/api/v1/sms-templates");
        if (response.ok) {
          const result = await response.json();
          setTemplatesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch SMS templates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const stats = React.useMemo(() => {
    const activeCount = templatesData.filter((t) => t.status === SMS_TEMPLATE_STATUS.ACTIVE).length;
    const totalSent = templatesData.reduce((acc, t) => acc + (t.usageCount || 0), 0);

    return [
      { id: "total", label: "Total Templates", value: templatesData.length },
      { id: "active", label: "Active", value: activeCount },
      { id: "sent", label: "Total Sent", value: totalSent, format: "number" as const },
      { id: "categories", label: "Categories", value: 4 },
    ];
  }, [templatesData]);

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
    <DataViewPage<SmsTemplate>
      config={smsTemplatesPageConfig}
      data={templatesData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["name", "message"]}
      onAction={handleAction}
    />
  );
}
