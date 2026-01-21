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
  Shield,
  Calendar,
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  FileText,
  DollarSign,
} from "lucide-react";

interface InsurancePolicy {
  id: string;
  name: string;
  type: "general_liability" | "event_cancellation" | "equipment" | "workers_comp" | "auto" | "umbrella";
  provider: string;
  policyNumber: string;
  eventName?: string;
  coverageAmount: number;
  premium: number;
  deductible: number;
  startDate: string;
  endDate: string;
  status: "active" | "pending" | "expired" | "cancelled";
  certificateOnFile: boolean;
}

const insurancePolicies: InsurancePolicy[] = [
  {
    id: "1",
    name: "General Liability Insurance",
    type: "general_liability",
    provider: "EventSafe Insurance Co.",
    policyNumber: "GL-2024-001234",
    eventName: "Summer Festival 2024",
    coverageAmount: 5000000,
    premium: 12500,
    deductible: 5000,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    certificateOnFile: true,
  },
  {
    id: "2",
    name: "Event Cancellation Insurance",
    type: "event_cancellation",
    provider: "Festival Guard Insurance",
    policyNumber: "EC-2024-005678",
    eventName: "Summer Festival 2024",
    coverageAmount: 2000000,
    premium: 35000,
    deductible: 25000,
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    status: "active",
    certificateOnFile: true,
  },
  {
    id: "3",
    name: "Equipment Coverage",
    type: "equipment",
    provider: "TechProtect Insurance",
    policyNumber: "EQ-2024-002345",
    coverageAmount: 1500000,
    premium: 8500,
    deductible: 2500,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    certificateOnFile: true,
  },
  {
    id: "4",
    name: "Workers Compensation",
    type: "workers_comp",
    provider: "WorkSafe Insurance",
    policyNumber: "WC-2024-003456",
    coverageAmount: 1000000,
    premium: 15000,
    deductible: 1000,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    certificateOnFile: true,
  },
  {
    id: "5",
    name: "Umbrella Policy",
    type: "umbrella",
    provider: "EventSafe Insurance Co.",
    policyNumber: "UM-2024-004567",
    coverageAmount: 10000000,
    premium: 25000,
    deductible: 10000,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "active",
    certificateOnFile: false,
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  general_liability: { label: "General Liability", color: "bg-blue-500" },
  event_cancellation: { label: "Event Cancellation", color: "bg-purple-500" },
  equipment: { label: "Equipment", color: "bg-green-500" },
  workers_comp: { label: "Workers Comp", color: "bg-orange-500" },
  auto: { label: "Auto", color: "bg-gray-500" },
  umbrella: { label: "Umbrella", color: "bg-pink-500" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Active", color: "bg-green-500", icon: CheckCircle },
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  expired: { label: "Expired", color: "bg-red-500", icon: AlertTriangle },
  cancelled: { label: "Cancelled", color: "bg-gray-500", icon: AlertTriangle },
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

export default function InsurancePage() {
  const activePolicies = insurancePolicies.filter((p) => p.status === "active").length;
  const totalCoverage = insurancePolicies.filter((p) => p.status === "active").reduce((acc, p) => acc + p.coverageAmount, 0);
  const totalPremiums = insurancePolicies.filter((p) => p.status === "active").reduce((acc, p) => acc + p.premium, 0);
  const missingCerts = insurancePolicies.filter((p) => !p.certificateOnFile && p.status === "active").length;

  const stats = {
    totalPolicies: insurancePolicies.length,
    activePolicies,
    totalCoverage,
    totalPremiums,
    missingCerts,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insurance"
        description="Manage insurance policies and certificates"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Policy
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Active Policies"
          value={stats.activePolicies}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Total Coverage"
          value={formatCurrency(stats.totalCoverage)}
          icon={Shield}
        />
        <StatCard
          title="Annual Premiums"
          value={formatCurrency(stats.totalPremiums)}
          icon={DollarSign}
        />
        <StatCard
          title="Missing Certificates"
          value={stats.missingCerts}
          valueClassName="text-yellow-500"
          icon={AlertTriangle}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search policies..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {insurancePolicies.map((policy) => {
          const type = typeConfig[policy.type];
          const status = statusConfig[policy.status];
          const StatusIcon = status.icon;

          return (
            <Card key={policy.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={`${type.color} text-white`}>
                          {type.label}
                        </Badge>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                        {policy.certificateOnFile ? (
                          <Badge variant="outline" className="text-green-600 border-green-500">
                            <FileText className="mr-1 h-3 w-3" />
                            Certificate on File
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-500">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Certificate Missing
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base">{policy.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {policy.provider} • {policy.policyNumber}
                      </CardDescription>
                      {policy.eventName && (
                        <p className="text-sm text-muted-foreground mt-1">Event: {policy.eventName}</p>
                      )}
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
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download Certificate
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Policy</DropdownMenuItem>
                      <DropdownMenuItem>File Claim</DropdownMenuItem>
                      <DropdownMenuItem>Renew Policy</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Cancel Policy</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{formatCurrency(policy.coverageAmount)}</p>
                    <p className="text-xs text-muted-foreground">Coverage</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{formatCurrency(policy.premium)}</p>
                    <p className="text-xs text-muted-foreground">Premium</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{formatCurrency(policy.deductible)}</p>
                    <p className="text-xs text-muted-foreground">Deductible</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold flex items-center justify-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(policy.endDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">Expires</p>
                  </div>
                </div>

                <div className="pt-3 border-t text-sm text-muted-foreground">
                  <span>Coverage Period: {formatDate(policy.startDate)} - {formatDate(policy.endDate)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
