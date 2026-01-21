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
  DollarSign,
  Users,
  Calendar,
  Target,
  BarChart3,
} from "lucide-react";

interface ForecastMetric {
  id: string;
  name: string;
  category: "revenue" | "attendance" | "expenses" | "profit";
  currentValue: number;
  forecastValue: number;
  previousValue: number;
  trend: "up" | "down" | "stable";
  confidence: number;
  unit: string;
}

const forecastMetrics: ForecastMetric[] = [
  {
    id: "1",
    name: "Q3 Revenue",
    category: "revenue",
    currentValue: 1250000,
    forecastValue: 1450000,
    previousValue: 1100000,
    trend: "up",
    confidence: 85,
    unit: "$",
  },
  {
    id: "2",
    name: "Summer Festival Attendance",
    category: "attendance",
    currentValue: 45000,
    forecastValue: 52000,
    previousValue: 42000,
    trend: "up",
    confidence: 78,
    unit: "",
  },
  {
    id: "3",
    name: "Q3 Operating Expenses",
    category: "expenses",
    currentValue: 850000,
    forecastValue: 920000,
    previousValue: 780000,
    trend: "up",
    confidence: 82,
    unit: "$",
  },
  {
    id: "4",
    name: "Q3 Net Profit",
    category: "profit",
    currentValue: 400000,
    forecastValue: 530000,
    previousValue: 320000,
    trend: "up",
    confidence: 72,
    unit: "$",
  },
];

interface ForecastScenario {
  id: string;
  name: string;
  description: string;
  probability: number;
  revenueImpact: number;
  status: "optimistic" | "baseline" | "pessimistic";
}

const scenarios: ForecastScenario[] = [
  {
    id: "1",
    name: "Optimistic Scenario",
    description: "Strong ticket sales, all sponsorships confirmed, favorable weather",
    probability: 25,
    revenueImpact: 1650000,
    status: "optimistic",
  },
  {
    id: "2",
    name: "Baseline Scenario",
    description: "Expected performance based on current trends and confirmed bookings",
    probability: 55,
    revenueImpact: 1450000,
    status: "baseline",
  },
  {
    id: "3",
    name: "Pessimistic Scenario",
    description: "Lower attendance, potential cancellations, weather disruptions",
    probability: 20,
    revenueImpact: 1150000,
    status: "pessimistic",
  },
];

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  revenue: { label: "Revenue", color: "bg-green-500", icon: DollarSign },
  attendance: { label: "Attendance", color: "bg-blue-500", icon: Users },
  expenses: { label: "Expenses", color: "bg-orange-500", icon: DollarSign },
  profit: { label: "Profit", color: "bg-purple-500", icon: TrendingUp },
};

const scenarioConfig: Record<string, { color: string }> = {
  optimistic: { color: "bg-green-500" },
  baseline: { color: "bg-blue-500" },
  pessimistic: { color: "bg-red-500" },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

function calculateChange(current: number, previous: number): number {
  return Math.round(((current - previous) / previous) * 100);
}

export default function ForecastingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecasting"
        description="Financial projections and scenario planning"
        actions={
          <Button>
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {forecastMetrics.map((metric) => {
          const category = categoryConfig[metric.category];
          const CategoryIcon = category.icon;
          const change = calculateChange(metric.forecastValue, metric.previousValue);

          return (
            <Card key={metric.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CategoryIcon className="h-4 w-4" />
                  {metric.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.unit === "$" ? formatCurrency(metric.forecastValue) : formatNumber(metric.forecastValue)}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                    {change > 0 ? "+" : ""}{change}% vs last period
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Target className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {metric.confidence}% confidence
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
            <CardTitle>Scenario Analysis</CardTitle>
            <CardDescription>Revenue projections under different scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarios.map((scenario) => {
                const config = scenarioConfig[scenario.status];

                return (
                  <div key={scenario.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{scenario.name}</h4>
                          <Badge className={`${config.color} text-white capitalize`}>
                            {scenario.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {scenario.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(scenario.revenueImpact)}</p>
                        <p className="text-xs text-muted-foreground">{scenario.probability}% probability</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-3">
                      <div
                        className={`h-2 rounded-full ${config.color}`}
                        style={{ width: `${scenario.probability}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forecast Timeline</CardTitle>
            <CardDescription>Upcoming forecast milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">Q3 Revenue Target</p>
                  <p className="text-sm text-muted-foreground">Due: September 30, 2024</p>
                </div>
                <Badge className="bg-blue-500 text-white">On Track</Badge>
              </div>
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">Summer Festival Break-Even</p>
                  <p className="text-sm text-muted-foreground">Target: 35,000 tickets</p>
                </div>
                <Badge className="bg-green-500 text-white">Achieved</Badge>
              </div>
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="font-medium">Sponsorship Revenue Goal</p>
                  <p className="text-sm text-muted-foreground">Target: $500,000</p>
                </div>
                <Badge className="bg-yellow-500 text-white">85% Complete</Badge>
              </div>
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div className="flex-1">
                  <p className="font-medium">Annual Profit Margin</p>
                  <p className="text-sm text-muted-foreground">Target: 25%</p>
                </div>
                <Badge className="bg-purple-500 text-white">Projected 28%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
