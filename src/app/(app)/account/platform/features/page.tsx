"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import { Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  tier: string;
}

export default function AccountPlatformFeaturesPage() {
  const [features, setFeatures] = React.useState<Feature[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchFeatures() {
      try {
        const response = await fetch("/api/v1/account/platform/features");
        if (response.ok) {
          const result = await response.json();
          setFeatures(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch features:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatures();
  }, []);

  const enabledCount = features.filter((f) => f.enabled).length;
  const disabledCount = features.filter((f) => !f.enabled).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Features"
        description="Manage platform features"
      />

      <StatGrid columns={3}>
        <StatCard
          title="Total Features"
          value={features.length}
          icon={Zap}
        />
        <StatCard
          title="Enabled"
          value={enabledCount}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Disabled"
          value={disabledCount}
          valueClassName="text-gray-500"
          icon={XCircle}
        />
      </StatGrid>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Feature Flags</CardTitle><CardDescription>Enable or disable features</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{feature.name}</h4><Badge variant="outline">{feature.tier}</Badge></div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <Switch checked={feature.enabled} disabled={feature.tier === "Enterprise"} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
