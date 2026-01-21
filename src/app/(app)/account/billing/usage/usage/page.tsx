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
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Users,
  FileText,
  Database,
  Zap,
  Calendar,
  TrendingUp,
} from "lucide-react";

interface UsageMetric {
  id: string;
  name: string;
  current: number;
  limit: number;
  unit: string;
  icon: React.ElementType;
  trend: number;
}

const usageMetrics: UsageMetric[] = [
  {
    id: "1",
    name: "Active Users",
    current: 48,
    limit: 100,
    unit: "users",
    icon: Users,
    trend: 12,
  },
  {
    id: "2",
    name: "Storage Used",
    current: 45.2,
    limit: 100,
    unit: "GB",
    icon: Database,
    trend: 8,
  },
  {
    id: "3",
    name: "API Calls",
    current: 125000,
    limit: 500000,
    unit: "calls/month",
    icon: Zap,
    trend: 15,
  },
  {
    id: "4",
    name: "Documents",
    current: 2450,
    limit: 10000,
    unit: "files",
    icon: FileText,
    trend: 5,
  },
];

interface UsageHistory {
  period: string;
  users: number;
  storage: number;
  apiCalls: number;
}

const usageHistory: UsageHistory[] = [
  { period: "January 2024", users: 35, storage: 32.5, apiCalls: 85000 },
  { period: "February 2024", users: 38, storage: 35.8, apiCalls: 92000 },
  { period: "March 2024", users: 42, storage: 38.2, apiCalls: 98000 },
  { period: "April 2024", users: 44, storage: 40.5, apiCalls: 105000 },
  { period: "May 2024", users: 46, storage: 42.8, apiCalls: 115000 },
  { period: "June 2024", users: 48, storage: 45.2, apiCalls: 125000 },
];

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function UsagePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usage</h1>
          <p className="text-muted-foreground">
            Monitor your plan usage and limits
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {usageMetrics.map((metric) => {
          const Icon = metric.icon;
          const percentage = Math.round((metric.current / metric.limit) * 100);
          const isNearLimit = percentage > 80;

          return (
            <Card key={metric.id} className={isNearLimit ? "border-yellow-500" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {metric.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">
                    {typeof metric.current === "number" && metric.current >= 1000 
                      ? formatNumber(metric.current) 
                      : metric.current}
                  </span>
                  <span className="text-muted-foreground mb-1">/ {formatNumber(metric.limit)} {metric.unit}</span>
                </div>
                <Progress value={percentage} className="h-2 mt-2" />
                <div className="flex justify-between mt-2">
                  <span className={`text-xs ${isNearLimit ? "text-yellow-500" : "text-muted-foreground"}`}>
                    {percentage}% used
                  </span>
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{metric.trend}% this month
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage History</CardTitle>
            <CardDescription>Monthly usage trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageHistory.slice(-4).map((month) => (
                <div key={month.period} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {month.period}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Users</p>
                      <p className="font-medium">{month.users}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Storage</p>
                      <p className="font-medium">{month.storage} GB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">API Calls</p>
                      <p className="font-medium">{formatNumber(month.apiCalls)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>Your current subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">Enterprise Plan</p>
                  <p className="text-sm text-muted-foreground">Billed annually</p>
                </div>
                <span className="text-2xl font-bold">$499/mo</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing Period</span>
                <span className="font-medium">Jan 1 - Dec 31, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Invoice</span>
                <span className="font-medium">July 1, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">•••• 4521</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full">View Invoices</Button>
              <Button variant="outline" className="w-full">Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
          <CardDescription>Usage breakdown by feature</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Events Created</p>
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Reports Generated</p>
              <p className="text-2xl font-bold">89</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Emails Sent</p>
              <p className="text-2xl font-bold">2,450</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Integrations Active</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Connected</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Workflows Running</p>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Webhooks</p>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs text-muted-foreground">Configured</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
