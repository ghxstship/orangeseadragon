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
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw,
} from "lucide-react";

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
}

const metrics: MetricCard[] = [
  {
    title: "Total Revenue",
    value: "$1,245,890",
    change: 12.5,
    changeLabel: "vs last month",
    icon: DollarSign,
  },
  {
    title: "Active Projects",
    value: "24",
    change: 8.3,
    changeLabel: "vs last month",
    icon: BarChart3,
  },
  {
    title: "Team Members",
    value: "156",
    change: 4.2,
    changeLabel: "vs last month",
    icon: Users,
  },
  {
    title: "Events This Month",
    value: "12",
    change: -2.1,
    changeLabel: "vs last month",
    icon: Calendar,
  },
];

interface ChartData {
  label: string;
  value: number;
  color: string;
}

const revenueByCategory: ChartData[] = [
  { label: "Festivals", value: 450000, color: "bg-blue-500" },
  { label: "Corporate Events", value: 320000, color: "bg-green-500" },
  { label: "Concerts", value: 280000, color: "bg-purple-500" },
  { label: "Private Events", value: 195890, color: "bg-orange-500" },
];

const projectsByStatus: ChartData[] = [
  { label: "Active", value: 12, color: "bg-green-500" },
  { label: "Planning", value: 6, color: "bg-blue-500" },
  { label: "On Hold", value: 3, color: "bg-yellow-500" },
  { label: "Completed", value: 3, color: "bg-gray-500" },
];

const monthlyRevenue = [
  { month: "Jan", revenue: 85000 },
  { month: "Feb", revenue: 92000 },
  { month: "Mar", revenue: 78000 },
  { month: "Apr", revenue: 110000 },
  { month: "May", revenue: 125000 },
  { month: "Jun", revenue: 145000 },
  { month: "Jul", revenue: 168000 },
  { month: "Aug", revenue: 155000 },
  { month: "Sep", revenue: 142000 },
  { month: "Oct", revenue: 138000 },
  { month: "Nov", revenue: 152000 },
  { month: "Dec", revenue: 175890 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function AnalyticsPage() {
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));
  const totalCategoryRevenue = revenueByCategory.reduce((acc, c) => acc + c.value, 0);
  const totalProjects = projectsByStatus.reduce((acc, p) => acc + p.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Business insights and performance metrics"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? "+" : ""}{metric.change}%
                  </span>
                  <span className="text-xs text-muted-foreground">{metric.changeLabel}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monthly Revenue
            </CardTitle>
            <CardDescription>Revenue trend over the past 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monthlyRevenue.map((month) => (
                <div key={month.month} className="flex items-center gap-2">
                  <span className="w-8 text-xs text-muted-foreground">{month.month}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="w-20 text-xs text-right">{formatCurrency(month.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue by Category
            </CardTitle>
            <CardDescription>Distribution of revenue across event types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByCategory.map((category) => {
                const percentage = (category.value / totalCategoryRevenue) * 100;
                return (
                  <div key={category.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${category.color}`} />
                        <span className="text-sm font-medium">{category.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{formatCurrency(category.value)}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${category.color} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Projects by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectsByStatus.map((status) => {
                const percentage = (status.value / totalProjects) * 100;
                return (
                  <div key={status.label} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-24">
                      <span className={`w-3 h-3 rounded-full ${status.color}`} />
                      <span className="text-sm">{status.label}</span>
                    </div>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${status.color} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm font-medium text-right">{status.value}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Summer Festival 2024", revenue: 450000, tickets: 28500 },
                { name: "New Year's Eve Concert", revenue: 320000, tickets: 15000 },
                { name: "Tech Conference 2024", revenue: 180000, tickets: 2500 },
                { name: "Corporate Gala", revenue: 85000, tickets: 400 },
              ].map((event, idx) => (
                <div key={event.name} className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center">
                    {idx + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.tickets.toLocaleString()} tickets
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(event.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Avg. Project Duration", value: "45 days" },
                { label: "Client Satisfaction", value: "4.8/5.0" },
                { label: "On-Time Delivery", value: "94%" },
                { label: "Budget Adherence", value: "97%" },
                { label: "Team Utilization", value: "82%" },
                { label: "Repeat Clients", value: "68%" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="text-sm font-medium">{stat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
