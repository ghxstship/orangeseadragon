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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  CircleDot,
  Package,
  CheckCircle,
  AlertTriangle,
  Printer,
} from "lucide-react";

interface WristbandType {
  id: string;
  name: string;
  color: string;
  eventName: string;
  accessLevel: string;
  totalQuantity: number;
  distributed: number;
  activated: number;
  status: "active" | "inactive" | "depleted";
  rfidEnabled: boolean;
  price?: number;
}

const wristbandTypes: WristbandType[] = [
  {
    id: "1",
    name: "General Admission",
    color: "#22c55e",
    eventName: "Summer Festival 2024",
    accessLevel: "Standard Areas",
    totalQuantity: 15000,
    distributed: 12500,
    activated: 11800,
    status: "active",
    rfidEnabled: true,
    price: 75,
  },
  {
    id: "2",
    name: "VIP Access",
    color: "#a855f7",
    eventName: "Summer Festival 2024",
    accessLevel: "VIP + Standard Areas",
    totalQuantity: 2000,
    distributed: 2000,
    activated: 1950,
    status: "depleted",
    rfidEnabled: true,
    price: 250,
  },
  {
    id: "3",
    name: "Artist/Crew",
    color: "#f97316",
    eventName: "Summer Festival 2024",
    accessLevel: "All Access + Backstage",
    totalQuantity: 500,
    distributed: 320,
    activated: 315,
    status: "active",
    rfidEnabled: true,
  },
  {
    id: "4",
    name: "Media",
    color: "#3b82f6",
    eventName: "Summer Festival 2024",
    accessLevel: "Media Areas + Standard",
    totalQuantity: 200,
    distributed: 85,
    activated: 82,
    status: "active",
    rfidEnabled: true,
  },
  {
    id: "5",
    name: "Vendor",
    color: "#eab308",
    eventName: "Summer Festival 2024",
    accessLevel: "Vendor Areas Only",
    totalQuantity: 300,
    distributed: 180,
    activated: 175,
    status: "active",
    rfidEnabled: false,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Active", color: "bg-green-500", icon: CheckCircle },
  inactive: { label: "Inactive", color: "bg-gray-500", icon: CircleDot },
  depleted: { label: "Depleted", color: "bg-red-500", icon: AlertTriangle },
};

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function WristbandsPage() {
  const totalWristbands = wristbandTypes.reduce((acc, w) => acc + w.totalQuantity, 0);
  const totalDistributed = wristbandTypes.reduce((acc, w) => acc + w.distributed, 0);
  const totalActivated = wristbandTypes.reduce((acc, w) => acc + w.activated, 0);
  const remaining = totalWristbands - totalDistributed;

  const stats = {
    totalTypes: wristbandTypes.length,
    totalWristbands,
    totalDistributed,
    totalActivated,
    remaining,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wristbands</h1>
          <p className="text-muted-foreground">
            Manage wristband inventory and distribution
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Wristband Type
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalWristbands)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Distributed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{formatNumber(stats.totalDistributed)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatNumber(stats.totalActivated)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{formatNumber(stats.remaining)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search wristbands..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {wristbandTypes.map((wristband) => {
          const status = statusConfig[wristband.status];
          const StatusIcon = status.icon;
          const distributionProgress = Math.round((wristband.distributed / wristband.totalQuantity) * 100);
          const activationRate = Math.round((wristband.activated / wristband.distributed) * 100) || 0;

          return (
            <Card key={wristband.id} className={`hover:shadow-md transition-shadow ${wristband.status === "depleted" ? "border-red-500" : ""}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: wristband.color }}
                    >
                      <CircleDot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{wristband.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{wristband.eventName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${status.color} text-white`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                    {wristband.rfidEnabled && (
                      <Badge variant="outline">RFID</Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Type</DropdownMenuItem>
                        <DropdownMenuItem>
                          <Package className="mr-2 h-4 w-4" />
                          Add Inventory
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" />
                          Print Batch
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Distribution Log</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Access Level</span>
                    <span className="font-medium">{wristband.accessLevel}</span>
                  </div>

                  {wristband.price && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">{formatCurrency(wristband.price)}</span>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Distribution</span>
                      <span className="font-medium">
                        {formatNumber(wristband.distributed)} / {formatNumber(wristband.totalQuantity)}
                      </span>
                    </div>
                    <Progress value={distributionProgress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-xl font-bold">{formatNumber(wristband.totalQuantity - wristband.distributed)}</p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-500">{formatNumber(wristband.activated)}</p>
                      <p className="text-xs text-muted-foreground">Activated</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">{activationRate}%</p>
                      <p className="text-xs text-muted-foreground">Activation Rate</p>
                    </div>
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
