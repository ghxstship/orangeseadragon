"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { emailTemplatesPageConfig } from "@/config/pages/email-templates";
import { EMAIL_TEMPLATE_STATUS, type EmailTemplateStatus } from "@/lib/enums";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: "transactional" | "marketing" | "notification" | "reminder";
  status: EmailTemplateStatus;
  last_modified: string;
  usage_count: number;
}

export default function EmailTemplatesPage() {
  const [emailTemplatesData, setEmailTemplatesData] = React.useState<EmailTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchEmailTemplates() {
      try {
        const response = await fetch("/api/v1/email-templates");
        if (response.ok) {
          const result = await response.json();
          setEmailTemplatesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch email templates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmailTemplates();
  }, []);

  const stats = React.useMemo(() => {
    const active = emailTemplatesData.filter((t) => t.status === EMAIL_TEMPLATE_STATUS.ACTIVE).length;
    const totalUsage = emailTemplatesData.reduce((acc, t) => acc + (t.usage_count || 0), 0);
    return [
      { id: "total", label: "Total Templates", value: emailTemplatesData.length },
      { id: "active", label: "Active", value: active },
      { id: "sent", label: "Total Sent", value: totalUsage.toLocaleString() },
      { id: "categories", label: "Categories", value: 4 },
    ];
  }, [emailTemplatesData]);

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
    <DataViewPage<EmailTemplate>
      config={emailTemplatesPageConfig}
      data={emailTemplatesData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["name", "subject", "category"]}
      onAction={handleAction}
    />
  );
}
