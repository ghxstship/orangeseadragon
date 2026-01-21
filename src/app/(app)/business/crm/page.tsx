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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  Mail,
  Phone,
  Wallet,
  FileText,
} from "lucide-react";

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  owner: string;
}

interface Company {
  id: string;
  name: string;
  type: "prospect" | "client" | "partner" | "vendor";
  industry: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  dealCount: number;
  totalValue: number;
}

const deals: Deal[] = [
  {
    id: "1",
    name: "Summer Festival Production",
    company: "Festival Partners LLC",
    value: 250000,
    stage: "Proposal",
    probability: 50,
    expectedCloseDate: "2024-02-15",
    owner: "Sarah Chen",
  },
  {
    id: "2",
    name: "Corporate Event Series",
    company: "TechCorp Inc",
    value: 150000,
    stage: "Negotiation",
    probability: 75,
    expectedCloseDate: "2024-01-30",
    owner: "Mike Johnson",
  },
  {
    id: "3",
    name: "Concert Tour Support",
    company: "Live Nation",
    value: 500000,
    stage: "Qualified",
    probability: 25,
    expectedCloseDate: "2024-03-20",
    owner: "Emily Watson",
  },
  {
    id: "4",
    name: "Product Launch Event",
    company: "StartupXYZ",
    value: 75000,
    stage: "Lead",
    probability: 10,
    expectedCloseDate: "2024-04-10",
    owner: "Tom Wilson",
  },
];

const companies: Company[] = [
  {
    id: "1",
    name: "Festival Partners LLC",
    type: "client",
    industry: "Entertainment",
    contactName: "John Smith",
    contactEmail: "john@festivalpartners.com",
    contactPhone: "+1 (555) 123-4567",
    dealCount: 3,
    totalValue: 750000,
  },
  {
    id: "2",
    name: "TechCorp Inc",
    type: "prospect",
    industry: "Technology",
    contactName: "Jane Doe",
    contactEmail: "jane@techcorp.com",
    contactPhone: "+1 (555) 234-5678",
    dealCount: 1,
    totalValue: 150000,
  },
  {
    id: "3",
    name: "Live Nation",
    type: "partner",
    industry: "Entertainment",
    contactName: "Bob Wilson",
    contactEmail: "bob@livenation.com",
    contactPhone: "+1 (555) 345-6789",
    dealCount: 5,
    totalValue: 2000000,
  },
  {
    id: "4",
    name: "Sound Systems Pro",
    type: "vendor",
    industry: "Audio Equipment",
    contactName: "Alice Brown",
    contactEmail: "alice@soundsystems.com",
    contactPhone: "+1 (555) 456-7890",
    dealCount: 0,
    totalValue: 0,
  },
];

const stageConfig: Record<string, { color: string }> = {
  Lead: { color: "bg-gray-500" },
  Qualified: { color: "bg-blue-500" },
  Proposal: { color: "bg-yellow-500" },
  Negotiation: { color: "bg-purple-500" },
  Won: { color: "bg-green-500" },
  Lost: { color: "bg-red-500" },
};

const companyTypeConfig: Record<string, { label: string; color: string }> = {
  prospect: { label: "Prospect", color: "bg-blue-500" },
  client: { label: "Client", color: "bg-green-500" },
  partner: { label: "Partner", color: "bg-purple-500" },
  vendor: { label: "Vendor", color: "bg-orange-500" },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CRMPage() {
  const [activeTab, setActiveTab] = React.useState<"deals" | "companies">("deals");

  const dealStats = {
    totalValue: deals.reduce((acc, d) => acc + d.value, 0),
    weightedValue: deals.reduce((acc, d) => acc + d.value * (d.probability / 100), 0),
    dealCount: deals.length,
    avgDealSize: Math.round(deals.reduce((acc, d) => acc + d.value, 0) / deals.length),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM"
        description="Manage deals, companies, and contacts"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Building2 className="mr-2 h-4 w-4" />
              Add Company
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          </div>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(dealStats.totalValue)}
          icon={Wallet}
        />
        <StatCard
          title="Weighted Value"
          value={formatCurrency(dealStats.weightedValue)}
          valueClassName="text-green-500"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Deals"
          value={dealStats.dealCount}
          valueClassName="text-blue-500"
          icon={FileText}
        />
        <StatCard
          title="Avg Deal Size"
          value={formatCurrency(dealStats.avgDealSize)}
          icon={DollarSign}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={activeTab === "deals" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("deals")}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Deals
          </Button>
          <Button
            variant={activeTab === "companies" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("companies")}
          >
            <Building2 className="mr-2 h-4 w-4" />
            Companies
          </Button>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={`Search ${activeTab}...`} className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {activeTab === "deals" ? (
        <Card>
          <CardHeader>
            <CardTitle>Active Deals</CardTitle>
            <CardDescription>Track and manage your sales pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{deal.name}</p>
                        <Badge className={`${stageConfig[deal.stage].color} text-white`}>
                          {deal.stage}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {deal.company} • {deal.owner}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(deal.value)}</p>
                      <p className="text-xs text-muted-foreground">
                        {deal.probability}% • Close {deal.expectedCloseDate}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Deal</DropdownMenuItem>
                        <DropdownMenuItem>Add Activity</DropdownMenuItem>
                        <DropdownMenuItem>Move Stage</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{company.name}</CardTitle>
                      <Badge
                        className={`${companyTypeConfig[company.type].color} text-white mt-1`}
                      >
                        {companyTypeConfig[company.type].label}
                      </Badge>
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
                      <DropdownMenuItem>Add Contact</DropdownMenuItem>
                      <DropdownMenuItem>Create Deal</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{company.industry}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{company.dealCount} deals</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(company.totalValue)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t space-y-1">
                    <p className="text-sm font-medium">{company.contactName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{company.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{company.contactPhone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
