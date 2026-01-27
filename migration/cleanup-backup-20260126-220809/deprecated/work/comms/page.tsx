"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  Plus,
  MoreHorizontal,
  Radio,
  Headphones,
  CheckCircle,
  AlertCircle,
  Battery,
  Signal,
  Activity,
} from "lucide-react";

interface CommsDevice {
  id: string;
  deviceId: string;
  type: "radio" | "headset" | "beltpack" | "base_station";
  channel: string;
  assignedTo?: string;
  department: string;
  eventName: string;
  batteryLevel?: number;
  signalStrength?: number;
  status: "available" | "in_use" | "charging" | "maintenance" | "lost";
}

const commsDevices: CommsDevice[] = [
  {
    id: "1",
    deviceId: "RAD-001",
    type: "radio",
    channel: "CH1 - Production",
    assignedTo: "Sarah Chen",
    department: "Production",
    eventName: "Summer Festival 2024",
    batteryLevel: 85,
    signalStrength: 95,
    status: "in_use",
  },
  {
    id: "2",
    deviceId: "RAD-002",
    type: "radio",
    channel: "CH1 - Production",
    assignedTo: "Mike Johnson",
    department: "Audio",
    eventName: "Summer Festival 2024",
    batteryLevel: 72,
    signalStrength: 88,
    status: "in_use",
  },
  {
    id: "3",
    deviceId: "BP-001",
    type: "beltpack",
    channel: "CH2 - Stage",
    assignedTo: "Tom Wilson",
    department: "Lighting",
    eventName: "Summer Festival 2024",
    batteryLevel: 45,
    signalStrength: 92,
    status: "in_use",
  },
  {
    id: "4",
    deviceId: "HS-001",
    type: "headset",
    channel: "CH2 - Stage",
    department: "Audio",
    eventName: "Summer Festival 2024",
    status: "available",
  },
  {
    id: "5",
    deviceId: "RAD-003",
    type: "radio",
    channel: "CH3 - Security",
    department: "Security",
    eventName: "Summer Festival 2024",
    batteryLevel: 20,
    status: "charging",
  },
  {
    id: "6",
    deviceId: "BS-001",
    type: "base_station",
    channel: "All Channels",
    department: "Production",
    eventName: "Summer Festival 2024",
    signalStrength: 100,
    status: "in_use",
  },
  {
    id: "7",
    deviceId: "RAD-004",
    type: "radio",
    channel: "CH1 - Production",
    department: "Production",
    eventName: "Summer Festival 2024",
    status: "maintenance",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  available: { label: "Available", color: "bg-green-500", icon: CheckCircle },
  in_use: { label: "In Use", color: "bg-blue-500", icon: Radio },
  charging: { label: "Charging", color: "bg-yellow-500", icon: Battery },
  maintenance: { label: "Maintenance", color: "bg-orange-500", icon: AlertCircle },
  lost: { label: "Lost", color: "bg-red-500", icon: AlertCircle },
};

const typeConfig: Record<string, { label: string; icon: React.ElementType }> = {
  radio: { label: "Radio", icon: Radio },
  headset: { label: "Headset", icon: Headphones },
  beltpack: { label: "Beltpack", icon: Radio },
  base_station: { label: "Base Station", icon: Signal },
};

function getBatteryColor(level: number): string {
  if (level <= 20) return "text-red-500";
  if (level <= 50) return "text-yellow-500";
  return "text-green-500";
}

export default function CommsPage() {
  const stats = {
    totalDevices: commsDevices.length,
    inUse: commsDevices.filter((d) => d.status === "in_use").length,
    available: commsDevices.filter((d) => d.status === "available").length,
    lowBattery: commsDevices.filter((d) => d.batteryLevel && d.batteryLevel <= 30).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Communications"
        description="Manage radios and comms equipment"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Device
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Devices"
          value={stats.totalDevices}
          icon={Radio}
        />
        <StatCard
          title="In Use"
          value={stats.inUse}
          valueClassName="text-blue-500"
          icon={Activity}
        />
        <StatCard
          title="Available"
          value={stats.available}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Low Battery"
          value={stats.lowBattery}
          valueClassName="text-red-500"
          icon={Battery}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search devices..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {commsDevices.map((device) => {
          const status = statusConfig[device.status];
          const type = typeConfig[device.type];
          const StatusIcon = status.icon;
          const TypeIcon = type.icon;

          return (
            <Card key={device.id} className={`hover:shadow-md transition-shadow ${device.batteryLevel && device.batteryLevel <= 30 ? "border-red-500" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-mono">{device.deviceId}</CardTitle>
                      <p className="text-sm text-muted-foreground">{type.label}</p>
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
                      {device.status === "available" && (
                        <DropdownMenuItem>Assign to User</DropdownMenuItem>
                      )}
                      {device.status === "in_use" && (
                        <DropdownMenuItem>Return Device</DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Change Channel</DropdownMenuItem>
                      <DropdownMenuItem>Mark for Maintenance</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Report Lost</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${status.color} text-white`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                    <Badge variant="outline">{device.channel}</Badge>
                  </div>

                  {device.assignedTo && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Assigned to:</span>{" "}
                      <span className="font-medium">{device.assignedTo}</span>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    {device.department} • {device.eventName}
                  </div>

                  {(device.batteryLevel !== undefined || device.signalStrength !== undefined) && (
                    <div className="flex items-center gap-4 pt-3 border-t">
                      {device.batteryLevel !== undefined && (
                        <div className="flex items-center gap-1">
                          <Battery className={`h-4 w-4 ${getBatteryColor(device.batteryLevel)}`} />
                          <span className={`text-sm font-medium ${getBatteryColor(device.batteryLevel)}`}>
                            {device.batteryLevel}%
                          </span>
                        </div>
                      )}
                      {device.signalStrength !== undefined && (
                        <div className="flex items-center gap-1">
                          <Signal className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-500">
                            {device.signalStrength}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
