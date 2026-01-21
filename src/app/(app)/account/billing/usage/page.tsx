"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import { BarChart3, Users, HardDrive, Zap, Loader2 } from "lucide-react";

interface UsageItem {
  name: string;
  used: number;
  limit: number;
  unit: string;
}

export default function AccountBillingUsagePage() {
  const [usage, setUsage] = React.useState<UsageItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await fetch("/api/v1/account/billing/usage");
        if (response.ok) {
          const result = await response.json();
          setUsage(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch usage:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

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
        title="Usage"
        description="Monitor your plan usage"
      />

      <StatGrid columns={4}>
        <StatCard
          title="Team Members"
          value="18 / 25"
          icon={Users}
        />
        <StatCard
          title="Events"
          value="45"
          description="Unlimited"
          icon={BarChart3}
        />
        <StatCard
          title="Storage"
          value="2.4 / 10 GB"
          icon={HardDrive}
        />
        <StatCard
          title="API Calls"
          value="8.5K / 50K"
          icon={Zap}
        />
      </StatGrid>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Current Usage</CardTitle><CardDescription>This billing period</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-6">
            {usage.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{item.name}</span>
                  <span>{item.used} {item.limit > 0 ? `/ ${item.limit}` : ""} {item.unit}</span>
                </div>
                <Progress value={item.limit > 0 ? (item.used / item.limit) * 100 : 100} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
