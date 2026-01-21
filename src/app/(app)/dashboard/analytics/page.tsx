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
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";

const metrics = [
  { label: "Total Revenue", value: "$1.2M", change: 15.3, trend: "up" },
  { label: "Events Hosted", value: "156", change: 8.2, trend: "up" },
  { label: "Avg Attendance", value: "342", change: -2.1, trend: "down" },
  { label: "Client Retention", value: "94%", change: 3.5, trend: "up" },
];

const topEvents = [
  { name: "Summer Music Festival", revenue: 125000, attendees: 5000, rating: 4.9 },
  { name: "Corporate Conference", revenue: 85000, attendees: 500, rating: 4.7 },
  { name: "Wedding Expo", revenue: 65000, attendees: 1200, rating: 4.8 },
  { name: "Tech Summit", revenue: 55000, attendees: 800, rating: 4.6 },
];

const revenueByCategory = [
  { category: "Festivals", amount: 450000, percentage: 38 },
  { category: "Corporate", amount: 320000, percentage: 27 },
  { category: "Weddings", amount: 250000, percentage: 21 },
  { category: "Private", amount: 180000, percentage: 14 },
];

export default function DashboardAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Performance metrics and insights
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className={`flex items-center text-xs ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {metric.change}% from last period
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Performing Events
            </CardTitle>
            <CardDescription>By revenue this quarter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topEvents.map((event, index) => (
                <div key={event.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {event.attendees.toLocaleString()} attendees
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(event.revenue / 1000).toFixed(0)}K</p>
                    <Badge variant="secondary">{event.rating} ★</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue by Category
            </CardTitle>
            <CardDescription>Distribution this year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByCategory.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.category}</span>
                    <span className="font-medium">${(item.amount / 1000).toFixed(0)}K ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
          <CardDescription>Event and revenue trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-end justify-between gap-2">
            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => {
              const height = 30 + Math.random() * 70;
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
