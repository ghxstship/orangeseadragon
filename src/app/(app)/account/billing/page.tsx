"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import { CreditCard, Calendar, DollarSign, Zap } from "lucide-react";

export default function AccountBillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your billing and subscription"
        actions={
          <Button variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        }
      />

      <StatGrid columns={3}>
        <StatCard
          title="Current Plan"
          value="Professional"
          description="Active"
          icon={Zap}
        />
        <StatCard
          title="Next Billing"
          value="Jul 1, 2024"
          icon={Calendar}
        />
        <StatCard
          title="Monthly Cost"
          value="$99.00"
          icon={DollarSign}
        />
      </StatGrid>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Payment Method</CardTitle><CardDescription>Your default payment method</CardDescription></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <CreditCard className="h-8 w-8" />
              <div><p className="font-medium">Visa ending in 4242</p><p className="text-sm text-muted-foreground">Expires 12/2025</p></div>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
