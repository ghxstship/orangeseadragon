"use client";

import * as React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  Package,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Truck,
  QrCode,
  DollarSign,
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  category: "audio" | "lighting" | "video" | "staging" | "power" | "rigging";
  assetTag: string;
  serialNumber: string;
  currentLocation: string;
  assignedEvent?: string;
  status: "available" | "deployed" | "in_transit" | "maintenance" | "retired";
  condition: "excellent" | "good" | "fair" | "poor";
  lastMaintenance: string;
  nextMaintenance: string;
  value: number;
}

const equipment: Equipment[] = [
  {
    id: "1",
    name: "L-Acoustics K2 Line Array (12 boxes)",
    category: "audio",
    assetTag: "AUD-001",
    serialNumber: "LA-K2-2024-001",
    currentLocation: "Warehouse A",
    assignedEvent: "Summer Festival 2024",
    status: "deployed",
    condition: "excellent",
    lastMaintenance: "2024-01-01",
    nextMaintenance: "2024-07-01",
    value: 250000,
  },
  {
    id: "2",
    name: "Robe MegaPointe (24 units)",
    category: "lighting",
    assetTag: "LGT-001",
    serialNumber: "ROBE-MP-2024-001",
    currentLocation: "City Arena",
    assignedEvent: "Summer Festival 2024",
    status: "deployed",
    condition: "good",
    lastMaintenance: "2023-12-15",
    nextMaintenance: "2024-06-15",
    value: 180000,
  },
  {
    id: "3",
    name: "ROE Visual LED Wall (100 panels)",
    category: "video",
    assetTag: "VID-001",
    serialNumber: "ROE-LED-2024-001",
    currentLocation: "In Transit",
    assignedEvent: "Summer Festival 2024",
    status: "in_transit",
    condition: "excellent",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-07-10",
    value: 350000,
  },
  {
    id: "4",
    name: "Stageline SL100 Mobile Stage",
    category: "staging",
    assetTag: "STG-001",
    serialNumber: "SL100-2023-001",
    currentLocation: "Warehouse B",
    status: "available",
    condition: "good",
    lastMaintenance: "2023-11-01",
    nextMaintenance: "2024-05-01",
    value: 150000,
  },
  {
    id: "5",
    name: "400A Power Distribution",
    category: "power",
    assetTag: "PWR-001",
    serialNumber: "PWR-400A-2024-001",
    currentLocation: "Maintenance Shop",
    status: "maintenance",
    condition: "fair",
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-02-15",
    value: 25000,
  },
  {
    id: "6",
    name: "CM Lodestar 1-Ton Chain Hoist (20 units)",
    category: "rigging",
    assetTag: "RIG-001",
    serialNumber: "CM-LS-2024-001",
    currentLocation: "Warehouse A",
    assignedEvent: "Corporate Gala 2024",
    status: "available",
    condition: "excellent",
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-07-05",
    value: 60000,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  available: { label: "Available", color: "bg-green-500", icon: CheckCircle },
  deployed: { label: "Deployed", color: "bg-blue-500", icon: MapPin },
  in_transit: { label: "In Transit", color: "bg-yellow-500", icon: Truck },
  maintenance: { label: "Maintenance", color: "bg-orange-500", icon: AlertTriangle },
  retired: { label: "Retired", color: "bg-gray-500", icon: Package },
};

const categoryConfig: Record<string, { label: string; color: string }> = {
  audio: { label: "Audio", color: "bg-blue-500" },
  lighting: { label: "Lighting", color: "bg-yellow-500" },
  video: { label: "Video", color: "bg-purple-500" },
  staging: { label: "Staging", color: "bg-green-500" },
  power: { label: "Power", color: "bg-red-500" },
  rigging: { label: "Rigging", color: "bg-orange-500" },
};

const conditionConfig: Record<string, { label: string; color: string }> = {
  excellent: { label: "Excellent", color: "text-green-600" },
  good: { label: "Good", color: "text-blue-600" },
  fair: { label: "Fair", color: "text-yellow-600" },
  poor: { label: "Poor", color: "text-red-600" },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function EquipmentTrackingPage() {
  const totalValue = equipment.reduce((acc, e) => acc + e.value, 0);
  const available = equipment.filter((e) => e.status === "available").length;
  const deployed = equipment.filter((e) => e.status === "deployed").length;
  const needsMaintenance = equipment.filter((e) => e.status === "maintenance" || e.condition === "fair" || e.condition === "poor").length;

  const stats = {
    totalItems: equipment.length,
    totalValue,
    available,
    deployed,
    needsMaintenance,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment Tracking"
        description="Track and manage equipment inventory"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
        />
        <StatCard
          title="Total Value"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
        />
        <StatCard
          title="Available / Deployed"
          value={`${stats.available} / ${stats.deployed}`}
          icon={CheckCircle}
        />
        <StatCard
          title="Needs Attention"
          value={stats.needsMaintenance}
          valueClassName="text-orange-500"
          icon={AlertTriangle}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search equipment..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {equipment.map((item) => {
          const status = statusConfig[item.status];
          const category = categoryConfig[item.category];
          const condition = conditionConfig[item.condition];
          const StatusIcon = status.icon;

          return (
            <Card key={item.id} className={`hover:shadow-md transition-shadow ${item.status === "maintenance" ? "border-orange-500" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <Package className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{item.name}</h3>
                        <Badge className={`${category.color} text-white`}>
                          {category.label}
                        </Badge>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        <span className={`text-sm font-medium ${condition.color}`}>
                          {condition.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono">
                          <QrCode className="h-4 w-4" />
                          {item.assetTag}
                        </span>
                        <span className="font-mono text-xs">{item.serialNumber}</span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {item.currentLocation}
                        </span>
                        {item.assignedEvent && (
                          <span>Event: {item.assignedEvent}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Last: {formatDate(item.lastMaintenance)}
                        </span>
                        <span>Next: {formatDate(item.nextMaintenance)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatCurrency(item.value)}</p>
                      <p className="text-xs text-muted-foreground">Asset Value</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Equipment</DropdownMenuItem>
                        <DropdownMenuItem>View History</DropdownMenuItem>
                        <DropdownMenuItem>Print QR Code</DropdownMenuItem>
                        {item.status === "available" && (
                          <DropdownMenuItem className="text-blue-600">Deploy</DropdownMenuItem>
                        )}
                        {item.status === "deployed" && (
                          <DropdownMenuItem className="text-green-600">Return</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-orange-600">Schedule Maintenance</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Retire</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
