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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Percent,
  Calendar,
} from "lucide-react";

interface ForecastMetric {
  id: string;
  name: string;
  current: number;
  forecast: number;
  target: number;
  trend: "up" | "down" | "stable";
  confidence: number;
}

const revenueForecasts: ForecastMetric[] = [
  {
    id: "1",
    name: "Q3 Revenue",
    current: 1250000,
    forecast: 1450000,
    target: 1500000,
    trend: "up",
    confidence: 85,
  },
  {
    id: "2",
    name: "Q4 Revenue",
    current: 0,
    forecast: 1680000,
    target: 1750000,
    trend: "up",
    confidence: 72,
  },
];

const costForecasts: ForecastMetric[] = [
  {
    id: "1",
    name: "Operating Costs",
    current: 450000,
    forecast: 520000,
    target: 500000,
    trend: "up",
    confidence: 78,
  },
  {
    id: "2",
    name: "Marketing Spend",
    current: 125000,
    forecast: 150000,
    target: 175000,
    trend: "stable",
    confidence: 82,
  },
];

const resourceForecasts = [
  { name: "Staff Utilization", current: 78, forecast: 85, target: 90 },
  { name: "Equipment Usage", current: 65, forecast: 72, target: 80 },
  { name: "Venue Bookings", current: 82, forecast: 88, target: 95 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ForecastPage() {
  const totalForecastRevenue = revenueForecasts.reduce((acc, f) => acc + f.forecast, 0);
  const totalTargetRevenue = revenueForecasts.reduce((acc, f) => acc + f.target, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forecast"
        description="Financial and resource forecasting"
        actions={
          <Badge className="bg-green-500 text-white">
            <TrendingUp className="mr-1 h-3 w-3" />
            On Track
          </Badge>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Forecast Revenue"
          value={formatCurrency(totalForecastRevenue)}
          icon={DollarSign}
        />
        <StatCard
          title="Target Achievement"
          value={`${Math.round((totalForecastRevenue / totalTargetRevenue) * 100)}%`}
          icon={Target}
        />
        <StatCard
          title="Avg Confidence"
          value="79%"
          valueClassName="text-green-500"
          icon={Percent}
        />
        <StatCard
          title="Forecast Period"
          value="Q3-Q4 2024"
          icon={Calendar}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Forecast
            </CardTitle>
            <CardDescription>Projected revenue by quarter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {revenueForecasts.map((forecast) => (
              <div key={forecast.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{forecast.name}</h4>
                      {forecast.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : forecast.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(forecast.forecast)}</p>
                    <p className="text-sm text-muted-foreground">
                      Target: {formatCurrency(forecast.target)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{forecast.confidence}% confidence</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {Math.round((forecast.forecast / forecast.target) * 100)}% of target
                    </p>
                  </div>
                </div>
                <Progress value={(forecast.forecast / forecast.target) * 100} className="h-2 mt-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Cost Forecast
            </CardTitle>
            <CardDescription>Projected costs and expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {costForecasts.map((forecast) => (
              <div key={forecast.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{forecast.name}</h4>
                      {forecast.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : forecast.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      ) : null}
                    </div>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(forecast.forecast)}</p>
                    <p className="text-sm text-muted-foreground">
                      Budget: {formatCurrency(forecast.target)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{forecast.confidence}% confidence</Badge>
                    <p className={`text-sm mt-1 ${forecast.forecast > forecast.target ? "text-red-500" : "text-green-500"}`}>
                      {forecast.forecast > forecast.target ? "Over budget" : "Under budget"}
                    </p>
                  </div>
                </div>
                <Progress value={(forecast.forecast / forecast.target) * 100} className="h-2 mt-3" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resource Utilization Forecast
          </CardTitle>
          <CardDescription>Projected resource usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {resourceForecasts.map((resource, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <h4 className="font-medium">{resource.name}</h4>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-3xl font-bold">{resource.forecast}%</span>
                  <span className="text-sm text-muted-foreground mb-1">forecast</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span>Current: {resource.current}%</span>
                  <span>•</span>
                  <span>Target: {resource.target}%</span>
                </div>
                <Progress value={resource.forecast} className="h-2 mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
