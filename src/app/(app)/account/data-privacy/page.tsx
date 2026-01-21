"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { dataPrivacyPageConfig } from "@/config/pages/data-privacy";

interface PrivacySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
}

export default function DataPrivacyPage() {
  const [privacySettingsData, setPrivacySettingsData] = React.useState<PrivacySetting[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPrivacySettings() {
      try {
        const response = await fetch("/api/v1/data-privacy");
        if (response.ok) {
          const result = await response.json();
          setPrivacySettingsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch privacy settings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPrivacySettings();
  }, []);

  const stats = React.useMemo(() => {
    const enabledSettings = privacySettingsData.filter((s) => s.enabled).length;

    return [
      { id: "score", label: "Privacy Score", value: "92%" },
      { id: "enabled", label: "Settings Enabled", value: `${enabledSettings}/${privacySettingsData.length}` },
      { id: "requests", label: "Data Requests", value: "3 pending" },
      { id: "audit", label: "Last Audit", value: "June 1, 2024" },
    ];
  }, [privacySettingsData]);

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
    <DataViewPage<PrivacySetting>
      config={dataPrivacyPageConfig}
      data={privacySettingsData}
      stats={stats}
      getRowId={(s) => s.id}
      searchFields={["name", "description"]}
      onAction={handleAction}
    />
  );
}
