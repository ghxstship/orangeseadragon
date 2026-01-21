"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
  FileCheck,
  Calendar,
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  DollarSign,
} from "lucide-react";

interface PermitLicense {
  id: string;
  name: string;
  type: "event" | "alcohol" | "food" | "noise" | "fire" | "health" | "building" | "entertainment";
  issuingAuthority: string;
  eventName: string;
  permitNumber: string;
  issueDate: string;
  expiryDate: string;
  status: "pending" | "approved" | "active" | "expired" | "rejected";
  cost: number;
  renewalRequired: boolean;
  daysUntilExpiry: number;
}

const permitsLicenses: PermitLicense[] = [
  {
    id: "1",
    name: "Special Event Permit",
    type: "event",
    issuingAuthority: "City Events Office",
    eventName: "Summer Festival 2024",
    permitNumber: "EVT-2024-001234",
    issueDate: "2024-03-15",
    expiryDate: "2024-06-20",
    status: "active",
    cost: 2500,
    renewalRequired: false,
    daysUntilExpiry: 5,
  },
  {
    id: "2",
    name: "Liquor License - Temporary",
    type: "alcohol",
    issuingAuthority: "State Liquor Authority",
    eventName: "Summer Festival 2024",
    permitNumber: "LIQ-2024-005678",
    issueDate: "2024-04-01",
    expiryDate: "2024-06-16",
    status: "active",
    cost: 1500,
    renewalRequired: false,
    daysUntilExpiry: 1,
  },
  {
    id: "3",
    name: "Food Service Permit",
    type: "food",
    issuingAuthority: "Health Department",
    eventName: "Summer Festival 2024",
    permitNumber: "FD-2024-002345",
    issueDate: "2024-04-10",
    expiryDate: "2024-06-20",
    status: "active",
    cost: 800,
    renewalRequired: false,
    daysUntilExpiry: 5,
  },
  {
    id: "4",
    name: "Noise Variance Permit",
    type: "noise",
    issuingAuthority: "City Planning",
    eventName: "Summer Festival 2024",
    permitNumber: "NV-2024-000123",
    issueDate: "2024-05-01",
    expiryDate: "2024-06-16",
    status: "active",
    cost: 500,
    renewalRequired: false,
    daysUntilExpiry: 1,
  },
  {
    id: "5",
    name: "Fire Safety Certificate",
    type: "fire",
    issuingAuthority: "Fire Marshal",
    eventName: "Summer Festival 2024",
    permitNumber: "FS-2024-003456",
    issueDate: "2024-05-20",
    expiryDate: "2024-06-20",
    status: "pending",
    cost: 350,
    renewalRequired: false,
    daysUntilExpiry: 5,
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  event: { label: "Event", color: "bg-purple-500" },
  alcohol: { label: "Alcohol", color: "bg-red-500" },
  food: { label: "Food", color: "bg-orange-500" },
  noise: { label: "Noise", color: "bg-blue-500" },
  fire: { label: "Fire", color: "bg-yellow-500" },
  health: { label: "Health", color: "bg-green-500" },
  building: { label: "Building", color: "bg-gray-500" },
  entertainment: { label: "Entertainment", color: "bg-pink-500" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  approved: { label: "Approved", color: "bg-blue-500", icon: CheckCircle },
  active: { label: "Active", color: "bg-green-500", icon: CheckCircle },
  expired: { label: "Expired", color: "bg-red-500", icon: AlertTriangle },
  rejected: { label: "Rejected", color: "bg-red-600", icon: AlertTriangle },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function PermitsLicensesPage() {
  const activePermits = permitsLicenses.filter((p) => p.status === "active").length;
  const pendingPermits = permitsLicenses.filter((p) => p.status === "pending").length;
  const expiringPermits = permitsLicenses.filter((p) => p.daysUntilExpiry <= 7 && p.status === "active").length;
  const totalCost = permitsLicenses.reduce((acc, p) => acc + p.cost, 0);

  const stats = {
    totalPermits: permitsLicenses.length,
    activePermits,
    pendingPermits,
    expiringPermits,
    totalCost,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permits & Licenses"
        description="Track permits and regulatory compliance"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Permit
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Permits"
          value={stats.totalPermits}
          icon={FileCheck}
        />
        <StatCard
          title="Active"
          value={stats.activePermits}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringPermits}
          valueClassName="text-yellow-500"
          icon={AlertTriangle}
        />
        <StatCard
          title="Total Cost"
          value={formatCurrency(stats.totalCost)}
          icon={DollarSign}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search permits..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {permitsLicenses.map((permit) => {
          const type = typeConfig[permit.type];
          const status = statusConfig[permit.status];
          const StatusIcon = status.icon;
          const isExpiringSoon = permit.daysUntilExpiry <= 7 && permit.status === "active";

          return (
            <Card key={permit.id} className={`hover:shadow-md transition-shadow ${isExpiringSoon ? "border-yellow-500" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{permit.name}</h3>
                        <Badge className={`${type.color} text-white`}>
                          {type.label}
                        </Badge>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        {isExpiringSoon && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {permit.daysUntilExpiry} days left
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {permit.issuingAuthority}
                        </span>
                        <span className="font-mono text-xs">{permit.permitNumber}</span>
                      </div>

                      <CardDescription className="mt-1">{permit.eventName}</CardDescription>

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Issued: {formatDate(permit.issueDate)}
                        </span>
                        <span>Expires: {formatDate(permit.expiryDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatCurrency(permit.cost)}</p>
                      <p className="text-xs text-muted-foreground">Permit Fee</p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Permit</DropdownMenuItem>
                        {permit.renewalRequired && (
                          <DropdownMenuItem className="text-blue-600">Renew Permit</DropdownMenuItem>
                        )}
                        <DropdownMenuItem>View History</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
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
