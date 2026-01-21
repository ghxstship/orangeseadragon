"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common";
import {
  CreditCard,
  Download,
  CheckCircle,
  Calendar,
  Users,
  HardDrive,
  Zap,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

interface UsageMetric {
  name: string;
  current: number;
  limit: number;
  unit?: string;
  icon: React.ElementType;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BillingPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [usageMetrics, setUsageMetrics] = React.useState<UsageMetric[]>([
    { name: "Team Members", current: 0, limit: 50, icon: Users },
    { name: "Storage Used", current: 0, limit: 100, unit: "GB", icon: HardDrive },
    { name: "API Calls", current: 0, limit: 50000, icon: Zap },
    { name: "Projects", current: 0, limit: 100, icon: Calendar },
  ]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchBillingData() {
      try {
        const response = await fetch("/api/v1/billing");
        if (response.ok) {
          const result = await response.json();
          if (result.data?.invoices) {
            setInvoices(result.data.invoices);
          }
          if (result.data?.usage) {
            setUsageMetrics([
              { name: "Team Members", current: result.data.usage.team_members || 0, limit: 50, icon: Users },
              { name: "Storage Used", current: result.data.usage.storage || 0, limit: 100, unit: "GB", icon: HardDrive },
              { name: "API Calls", current: result.data.usage.api_calls || 0, limit: 50000, icon: Zap },
              { name: "Projects", current: result.data.usage.projects || 0, limit: 100, icon: Calendar },
            ]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch billing data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBillingData();
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
        title="Billing"
        description="Manage your subscription and billing"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </div>
              <Badge className="bg-primary text-primary-foreground">Pro</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-bold">$299</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <div className="space-y-3 mb-6">
              {[
                "Up to 50 team members",
                "100 GB storage",
                "Unlimited projects",
                "Advanced analytics",
                "Priority support",
                "API access",
                "Custom integrations",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
              <Button variant="outline">Change Plan</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Your default payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 border rounded-lg mb-4">
              <div className="p-2 bg-muted rounded">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Update Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Current billing period usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {usageMetrics.map((metric) => {
              const Icon = metric.icon;
              const percentage = (metric.current / metric.limit) * 100;
              return (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{metric.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {metric.current.toLocaleString()} / {metric.limit.toLocaleString()}
                      {metric.unit && ` ${metric.unit}`}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percentage > 80 ? "bg-yellow-500" : percentage > 95 ? "bg-red-500" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(percentage)}% used
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your recent invoices</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-4 font-medium">Invoice</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t">
                    <td className="p-4 font-medium">{invoice.id}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(invoice.date)}</td>
                    <td className="p-4">{formatCurrency(invoice.amount)}</td>
                    <td className="p-4">
                      <Badge
                        className={
                          invoice.status === "paid"
                            ? "bg-green-500 text-white"
                            : invoice.status === "pending"
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        }
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
            <div>
              <p className="font-medium">Cancel Subscription</p>
              <p className="text-sm text-muted-foreground">
                Cancel your subscription and lose access at the end of the billing period
              </p>
            </div>
            <Button variant="destructive">Cancel Subscription</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
