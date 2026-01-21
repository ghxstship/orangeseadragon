"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { environmentConfigPageConfig } from "@/config/pages/environment-config";

interface EnvVariable {
  id: string;
  key: string;
  value: string;
  is_secret: boolean;
  environment: "production" | "staging" | "development" | "all";
  description?: string;
  updated_at: string;
}

export default function EnvironmentConfigPage() {
  const [envVariablesData, setEnvVariablesData] = React.useState<EnvVariable[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchEnvVariables() {
      try {
        const response = await fetch("/api/v1/environment-config");
        if (response.ok) {
          const result = await response.json();
          setEnvVariablesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch environment variables:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEnvVariables();
  }, []);

  const stats = React.useMemo(() => {
    const secretCount = envVariablesData.filter((v) => v.is_secret).length;
    const prodVars = envVariablesData.filter((v) => v.environment === "production" || v.environment === "all").length;

    return [
      { id: "total", label: "Total Variables", value: envVariablesData.length },
      { id: "secrets", label: "Secrets", value: secretCount },
      { id: "production", label: "Production", value: prodVars },
      { id: "environments", label: "Environments", value: 4 },
    ];
  }, [envVariablesData]);

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
    <DataViewPage<EnvVariable>
      config={environmentConfigPageConfig}
      data={envVariablesData}
      stats={stats}
      getRowId={(v) => v.id}
      searchFields={["key", "description"]}
      onAction={handleAction}
    />
  );
}
