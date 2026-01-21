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
import { Progress } from "@/components/ui/progress";
import {
  Leaf,
  Droplets,
  Zap,
  Recycle,
  TrendingDown,
  Target,
  Award,
} from "lucide-react";

interface SustainabilityMetric {
  id: string;
  name: string;
  category: "waste" | "energy" | "water" | "carbon";
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: "improving" | "stable" | "declining";
  percentageOfTarget: number;
}

interface SustainabilityInitiative {
  id: string;
  name: string;
  description: string;
  status: "active" | "planned" | "completed";
  impact: string;
}

const metrics: SustainabilityMetric[] = [
  {
    id: "1",
    name: "Waste Diversion Rate",
    category: "waste",
    currentValue: 72,
    targetValue: 80,
    unit: "%",
    trend: "improving",
    percentageOfTarget: 90,
  },
  {
    id: "2",
    name: "Energy from Renewables",
    category: "energy",
    currentValue: 45,
    targetValue: 60,
    unit: "%",
    trend: "improving",
    percentageOfTarget: 75,
  },
  {
    id: "3",
    name: "Water Conservation",
    category: "water",
    currentValue: 15000,
    targetValue: 20000,
    unit: "gal saved",
    trend: "stable",
    percentageOfTarget: 75,
  },
  {
    id: "4",
    name: "Carbon Offset",
    category: "carbon",
    currentValue: 850,
    targetValue: 1000,
    unit: "tons CO2",
    trend: "improving",
    percentageOfTarget: 85,
  },
];

const initiatives: SustainabilityInitiative[] = [
  {
    id: "1",
    name: "Zero Single-Use Plastics",
    description: "Eliminate all single-use plastic items from vendor operations",
    status: "active",
    impact: "Estimated 50,000 plastic items prevented",
  },
  {
    id: "2",
    name: "Solar-Powered Stages",
    description: "Power secondary stages with portable solar arrays",
    status: "active",
    impact: "30% reduction in generator fuel consumption",
  },
  {
    id: "3",
    name: "Reusable Cup Program",
    description: "Implement deposit-based reusable cup system",
    status: "completed",
    impact: "85% cup return rate achieved",
  },
  {
    id: "4",
    name: "Carbon Offset Partnership",
    description: "Partner with local reforestation project",
    status: "active",
    impact: "850 tons CO2 offset through tree planting",
  },
  {
    id: "5",
    name: "Electric Vehicle Fleet",
    description: "Transition all on-site vehicles to electric",
    status: "planned",
    impact: "Expected 40% reduction in on-site emissions",
  },
];

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  waste: { label: "Waste", color: "bg-green-500", icon: Recycle },
  energy: { label: "Energy", color: "bg-yellow-500", icon: Zap },
  water: { label: "Water", color: "bg-blue-500", icon: Droplets },
  carbon: { label: "Carbon", color: "bg-purple-500", icon: Leaf },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-500" },
  planned: { label: "Planned", color: "bg-blue-500" },
  completed: { label: "Completed", color: "bg-gray-500" },
};

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function SustainabilityPage() {
  const avgProgress = Math.round(metrics.reduce((acc, m) => acc + m.percentageOfTarget, 0) / metrics.length);
  const activeInitiatives = initiatives.filter((i) => i.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sustainability</h1>
          <p className="text-muted-foreground">
            Track environmental impact and initiatives
          </p>
        </div>
        <Button>
          <Leaf className="mr-2 h-4 w-4" />
          View Full Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{avgProgress}%</div>
            <Progress value={avgProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Initiatives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInitiatives}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Waste Diverted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">72%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carbon Offset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">850 tons</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Sustainability Metrics
            </CardTitle>
            <CardDescription>Progress toward environmental targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {metrics.map((metric) => {
                const category = categoryConfig[metric.category];
                const CategoryIcon = category.icon;

                return (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${category.color}`}>
                          <CategoryIcon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium">{metric.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {metric.trend === "improving" && (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <span className="font-bold">
                          {formatNumber(metric.currentValue)}{metric.unit}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Target: {formatNumber(metric.targetValue)}{metric.unit}
                        </span>
                        <span className={metric.percentageOfTarget >= 80 ? "text-green-500" : "text-yellow-500"}>
                          {metric.percentageOfTarget}%
                        </span>
                      </div>
                      <Progress value={metric.percentageOfTarget} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Sustainability Initiatives
            </CardTitle>
            <CardDescription>Active and planned environmental programs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {initiatives.map((initiative) => {
                const status = statusConfig[initiative.status];

                return (
                  <div key={initiative.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{initiative.name}</h4>
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {initiative.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Leaf className="h-3 w-3" />
                      {initiative.impact}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
