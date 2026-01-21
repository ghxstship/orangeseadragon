"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Trash2,
  Recycle,
  Leaf,
  MapPin,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface WasteStation {
  id: string;
  name: string;
  location: string;
  type: "general" | "recycling" | "compost" | "mixed";
  capacity: number;
  currentLevel: number;
  status: "normal" | "filling" | "full" | "overflow";
  lastEmptied: string;
  nextScheduled?: string;
}

const wasteStations: WasteStation[] = [
  {
    id: "1",
    name: "Main Stage Bins A",
    location: "Main Stage - North",
    type: "mixed",
    capacity: 100,
    currentLevel: 85,
    status: "filling",
    lastEmptied: "2024-06-15T14:00:00",
    nextScheduled: "2024-06-15T20:00:00",
  },
  {
    id: "2",
    name: "Food Court Recycling",
    location: "Food Court - Central",
    type: "recycling",
    capacity: 100,
    currentLevel: 95,
    status: "full",
    lastEmptied: "2024-06-15T12:00:00",
  },
  {
    id: "3",
    name: "VIP Area Waste",
    location: "VIP Pavilion",
    type: "general",
    capacity: 100,
    currentLevel: 45,
    status: "normal",
    lastEmptied: "2024-06-15T16:00:00",
    nextScheduled: "2024-06-15T22:00:00",
  },
  {
    id: "4",
    name: "Food Court Compost",
    location: "Food Court - East",
    type: "compost",
    capacity: 100,
    currentLevel: 70,
    status: "filling",
    lastEmptied: "2024-06-15T13:00:00",
  },
  {
    id: "5",
    name: "Electronic Stage Bins",
    location: "Electronic Stage",
    type: "mixed",
    capacity: 100,
    currentLevel: 30,
    status: "normal",
    lastEmptied: "2024-06-15T15:00:00",
    nextScheduled: "2024-06-15T21:00:00",
  },
  {
    id: "6",
    name: "Entrance Recycling",
    location: "Main Entrance",
    type: "recycling",
    capacity: 100,
    currentLevel: 55,
    status: "normal",
    lastEmptied: "2024-06-15T14:30:00",
  },
];

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  general: { label: "General", color: "bg-gray-500", icon: Trash2 },
  recycling: { label: "Recycling", color: "bg-blue-500", icon: Recycle },
  compost: { label: "Compost", color: "bg-green-500", icon: Leaf },
  mixed: { label: "Mixed", color: "bg-purple-500", icon: Trash2 },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  normal: { label: "Normal", color: "bg-green-500" },
  filling: { label: "Filling", color: "bg-yellow-500" },
  full: { label: "Full", color: "bg-red-500" },
  overflow: { label: "Overflow", color: "bg-red-700" },
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProgressColor(level: number): string {
  if (level >= 90) return "bg-red-500";
  if (level >= 70) return "bg-yellow-500";
  return "bg-green-500";
}

export default function WasteManagementPage() {
  const fullStations = wasteStations.filter((s) => s.status === "full" || s.status === "overflow").length;
  const fillingStations = wasteStations.filter((s) => s.status === "filling").length;
  const avgLevel = Math.round(wasteStations.reduce((acc, s) => acc + s.currentLevel, 0) / wasteStations.length);

  const stats = {
    totalStations: wasteStations.length,
    fullStations,
    fillingStations,
    avgLevel,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Waste Management</h1>
          <p className="text-muted-foreground">
            Monitor waste collection and recycling
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStations}</div>
          </CardContent>
        </Card>
        <Card className={stats.fullStations > 0 ? "border-red-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Full / Overflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500 flex items-center gap-2">
              {stats.fullStations > 0 && <AlertTriangle className="h-5 w-5" />}
              {stats.fullStations}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Filling Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.fillingStations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgLevel}%</div>
            <Progress value={stats.avgLevel} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wasteStations.map((station) => {
          const type = typeConfig[station.type];
          const status = statusConfig[station.status];
          const TypeIcon = type.icon;
          const progressColor = getProgressColor(station.currentLevel);

          return (
            <Card key={station.id} className={`hover:shadow-md transition-shadow ${station.status === "full" || station.status === "overflow" ? "border-red-500" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{station.name}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {station.location}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Request Pickup</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Emptied</DropdownMenuItem>
                      <DropdownMenuItem>View History</DropdownMenuItem>
                      <DropdownMenuItem>Report Issue</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={`${type.color} text-white`}>
                      {type.label}
                    </Badge>
                    <Badge className={`${status.color} text-white`}>
                      {station.status === "full" && <AlertTriangle className="mr-1 h-3 w-3" />}
                      {status.label}
                    </Badge>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Fill Level</span>
                      <span className="font-medium">{station.currentLevel}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${progressColor}`}
                        style={{ width: `${Math.min(station.currentLevel, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm pt-3 border-t">
                    <div>
                      <p className="text-muted-foreground">Last Emptied</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(station.lastEmptied)}
                      </p>
                    </div>
                    {station.nextScheduled && (
                      <div>
                        <p className="text-muted-foreground">Next Pickup</p>
                        <p className="font-medium">{formatTime(station.nextScheduled)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
