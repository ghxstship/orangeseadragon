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
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Gauge,
  Map,
} from "lucide-react";

interface Widget {
  id: string;
  name: string;
  type: "chart" | "table" | "metric" | "map" | "gauge";
  category: string;
  description: string;
  usedIn: number;
}

const widgets: Widget[] = [
  {
    id: "1",
    name: "Revenue Trend",
    type: "chart",
    category: "Finance",
    description: "Line chart showing revenue over time",
    usedIn: 5,
  },
  {
    id: "2",
    name: "Event Distribution",
    type: "chart",
    category: "Events",
    description: "Pie chart of events by category",
    usedIn: 3,
  },
  {
    id: "3",
    name: "Active Users Table",
    type: "table",
    category: "Users",
    description: "Table of most active users",
    usedIn: 4,
  },
  {
    id: "4",
    name: "KPI Scorecard",
    type: "metric",
    category: "Overview",
    description: "Key performance indicators",
    usedIn: 8,
  },
  {
    id: "5",
    name: "Venue Locations",
    type: "map",
    category: "Venues",
    description: "Map showing venue locations",
    usedIn: 2,
  },
  {
    id: "6",
    name: "Capacity Gauge",
    type: "gauge",
    category: "Operations",
    description: "Real-time capacity utilization",
    usedIn: 6,
  },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  chart: { icon: LineChart, color: "bg-blue-500" },
  table: { icon: Table, color: "bg-purple-500" },
  metric: { icon: BarChart3, color: "bg-green-500" },
  map: { icon: Map, color: "bg-orange-500" },
  gauge: { icon: Gauge, color: "bg-red-500" },
};

export default function WidgetsPage() {
  const categories = Array.from(new Set(widgets.map((w) => w.category)));
  const totalUsage = widgets.reduce((acc, w) => acc + w.usedIn, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Widgets</h1>
          <p className="text-muted-foreground">
            Reusable dashboard components
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Widget
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Widgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{widgets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Widget Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search widgets..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Widget Library
          </CardTitle>
          <CardDescription>Available dashboard widgets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {widgets.map((widget) => {
              const type = typeConfig[widget.type];
              const TypeIcon = type.icon;

              return (
                <div key={widget.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{widget.name}</h4>
                        <Badge variant="outline">{widget.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{widget.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Badge variant="secondary">{widget.category}</Badge>
                        <span>Used in {widget.usedIn} dashboards</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm" className="flex-1">Preview</Button>
                    <Button size="sm" className="flex-1">Add to Dashboard</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
