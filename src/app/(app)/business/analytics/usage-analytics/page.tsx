"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Users,
  Activity,
  Clock,
  TrendingUp,
} from "lucide-react";

interface UsageMetric {
  name: string;
  current: number;
  limit: number;
  unit: string;
}

const usageMetrics: UsageMetric[] = [
  { name: "API Calls", current: 45000, limit: 100000, unit: "calls" },
  { name: "Storage", current: 12.5, limit: 50, unit: "GB" },
  { name: "Team Members", current: 8, limit: 10, unit: "users" },
  { name: "Projects", current: 15, limit: -1, unit: "projects" },
];

const activityData = [
  { day: "Mon", users: 45, actions: 234 },
  { day: "Tue", users: 52, actions: 289 },
  { day: "Wed", users: 48, actions: 256 },
  { day: "Thu", users: 61, actions: 312 },
  { day: "Fri", users: 55, actions: 278 },
  { day: "Sat", users: 23, actions: 89 },
  { day: "Sun", users: 18, actions: 67 },
];

const topFeatures = [
  { name: "Dashboard", usage: 89 },
  { name: "Projects", usage: 76 },
  { name: "Calendar", usage: 65 },
  { name: "Reports", usage: 54 },
  { name: "Team", usage: 43 },
];

export default function UsageAnalyticsPage() {
  const totalActions = activityData.reduce((acc, d) => acc + d.actions, 0);
  const avgDailyUsers = Math.round(activityData.reduce((acc, d) => acc + d.users, 0) / activityData.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usage Analytics</h1>
          <p className="text-muted-foreground">
            Monitor platform usage and resource consumption
          </p>
        </div>
        <Badge className="bg-green-500 text-white">
          <TrendingUp className="mr-1 h-3 w-3" />
          +12% this month
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActions.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Daily Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDailyUsers}</div>
            <p className="text-sm text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              API Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45%</div>
            <p className="text-sm text-muted-foreground">Of monthly limit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">99.9%</div>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resource Usage
          </CardTitle>
          <CardDescription>Current usage vs limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usageMetrics.map((metric) => {
              const percentage = metric.limit > 0 ? (metric.current / metric.limit) * 100 : 0;
              const isUnlimited = metric.limit === -1;

              return (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{metric.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {metric.current.toLocaleString()} {isUnlimited ? metric.unit : `/ ${metric.limit.toLocaleString()} ${metric.unit}`}
                    </span>
                  </div>
                  {!isUnlimited && (
                    <Progress
                      value={percentage}
                      className={`h-2 ${percentage > 80 ? "[&>div]:bg-yellow-500" : percentage > 90 ? "[&>div]:bg-red-500" : ""}`}
                    />
                  )}
                  {isUnlimited && (
                    <Badge variant="outline">Unlimited</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
            <CardDescription>User activity by day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityData.map((day) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className="w-8 text-sm font-medium">{day.day}</span>
                  <div className="flex-1">
                    <Progress value={(day.actions / 350) * 100} className="h-2" />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground w-32">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {day.users}
                    </span>
                    <span>{day.actions} actions</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Top Features
            </CardTitle>
            <CardDescription>Most used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topFeatures.map((feature, idx) => (
                <div key={feature.name} className="flex items-center gap-4">
                  <span className="w-6 text-sm font-bold text-muted-foreground">#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{feature.name}</span>
                      <span className="text-sm text-muted-foreground">{feature.usage}%</span>
                    </div>
                    <Progress value={feature.usage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
