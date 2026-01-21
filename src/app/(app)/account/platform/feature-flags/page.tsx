"use client";

import * as React from "react";
import { DataViewPage } from "@/components/common/data-view-page";
import { featureFlagsPageConfig } from "@/config/pages/feature-flags";
import { Loader2 } from "lucide-react";

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environment: "all" | "production" | "staging" | "development";
  rollout_percentage: number;
  target_users?: number;
  created_at: string;
  updated_at: string;
}

export default function FeatureFlagsPage() {
  const [featureFlags, setFeatureFlags] = React.useState<FeatureFlag[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchFeatureFlags() {
      try {
        const response = await fetch("/api/v1/feature-flags");
        if (response.ok) {
          const result = await response.json();
          setFeatureFlags(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch feature flags:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatureFlags();
  }, []);

  const stats = React.useMemo(() => {
    const enabledFlags = featureFlags.filter((f) => f.enabled).length;
    const prodFlags = featureFlags.filter((f) => f.environment === "production" || f.environment === "all").length;
    const partialRollouts = featureFlags.filter((f) => (f.rollout_percentage || 0) > 0 && (f.rollout_percentage || 0) < 100).length;

    return [
      { id: "total", label: "Total Flags", value: featureFlags.length },
      { id: "enabled", label: "Enabled", value: enabledFlags },
      { id: "production", label: "In Production", value: prodFlags },
      { id: "partial", label: "Partial Rollouts", value: partialRollouts },
    ];
  }, [featureFlags]);

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
    <DataViewPage<FeatureFlag>
      config={featureFlagsPageConfig}
      data={featureFlags}
      stats={stats}
      getRowId={(f) => f.id}
      searchFields={["key", "name", "description"]}
      onAction={handleAction}
    />
  );
}
