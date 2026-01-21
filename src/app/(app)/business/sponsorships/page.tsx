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
  Award,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";

interface Sponsorship {
  id: string;
  sponsorName: string;
  sponsorLogo?: string;
  tier: "title" | "platinum" | "gold" | "silver" | "bronze" | "partner";
  eventName: string;
  value: number;
  paidAmount: number;
  status: "prospect" | "negotiating" | "confirmed" | "active" | "completed";
  contractSigned: boolean;
  startDate: string;
  endDate: string;
  benefits: string[];
  contactName: string;
  contactEmail: string;
}

const sponsorships: Sponsorship[] = [
  {
    id: "1",
    sponsorName: "TechCorp Global",
    tier: "title",
    eventName: "Summer Festival 2024",
    value: 500000,
    paidAmount: 500000,
    status: "active",
    contractSigned: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    benefits: ["Main Stage Naming Rights", "Logo on All Materials", "VIP Hospitality Suite", "20 Artist Meet & Greets"],
    contactName: "John Executive",
    contactEmail: "john@techcorp.com",
  },
  {
    id: "2",
    sponsorName: "Beverage Co",
    tier: "platinum",
    eventName: "Summer Festival 2024",
    value: 250000,
    paidAmount: 125000,
    status: "active",
    contractSigned: true,
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    benefits: ["Exclusive Beverage Rights", "Branded Bars", "VIP Access", "10 Artist Meet & Greets"],
    contactName: "Sarah Brand",
    contactEmail: "sarah@beverageco.com",
  },
  {
    id: "3",
    sponsorName: "Auto Manufacturer",
    tier: "gold",
    eventName: "Summer Festival 2024",
    value: 100000,
    paidAmount: 100000,
    status: "confirmed",
    contractSigned: true,
    startDate: "2024-03-01",
    endDate: "2024-08-31",
    benefits: ["Vehicle Display Area", "Logo on Stage", "VIP Tickets"],
    contactName: "Mike Motors",
    contactEmail: "mike@automanufacturer.com",
  },
  {
    id: "4",
    sponsorName: "Fashion Brand",
    tier: "silver",
    eventName: "Summer Festival 2024",
    value: 50000,
    paidAmount: 0,
    status: "negotiating",
    contractSigned: false,
    startDate: "2024-04-01",
    endDate: "2024-07-31",
    benefits: ["Merchandise Booth", "Logo on Website", "Social Media Mentions"],
    contactName: "Lisa Style",
    contactEmail: "lisa@fashionbrand.com",
  },
  {
    id: "5",
    sponsorName: "Local Restaurant Chain",
    tier: "bronze",
    eventName: "Summer Festival 2024",
    value: 25000,
    paidAmount: 25000,
    status: "active",
    contractSigned: true,
    startDate: "2024-05-01",
    endDate: "2024-06-30",
    benefits: ["Food Vendor Booth", "Logo on Map"],
    contactName: "Tom Food",
    contactEmail: "tom@localrestaurant.com",
  },
];

const tierConfig: Record<string, { label: string; color: string }> = {
  title: { label: "Title Sponsor", color: "bg-gradient-to-r from-yellow-400 to-yellow-600" },
  platinum: { label: "Platinum", color: "bg-gradient-to-r from-gray-300 to-gray-500" },
  gold: { label: "Gold", color: "bg-yellow-500" },
  silver: { label: "Silver", color: "bg-gray-400" },
  bronze: { label: "Bronze", color: "bg-orange-600" },
  partner: { label: "Partner", color: "bg-blue-500" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  prospect: { label: "Prospect", color: "bg-gray-500", icon: Clock },
  negotiating: { label: "Negotiating", color: "bg-yellow-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-500", icon: CheckCircle },
  active: { label: "Active", color: "bg-green-500", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-purple-500", icon: CheckCircle },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SponsorshipsPage() {
  const totalValue = sponsorships.reduce((acc, s) => acc + s.value, 0);
  const totalPaid = sponsorships.reduce((acc, s) => acc + s.paidAmount, 0);
  const activeSponsors = sponsorships.filter((s) => s.status === "active" || s.status === "confirmed").length;

  const stats = {
    totalSponsors: sponsorships.length,
    totalValue,
    totalPaid,
    activeSponsors,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sponsorships</h1>
          <p className="text-muted-foreground">
            Manage sponsor relationships and agreements
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Sponsor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSponsors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.totalPaid)}</div>
            <Progress value={(stats.totalPaid / stats.totalValue) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.activeSponsors}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search sponsors..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {sponsorships.map((sponsor) => {
          const tier = tierConfig[sponsor.tier];
          const status = statusConfig[sponsor.status];
          const StatusIcon = status.icon;
          const paymentProgress = Math.round((sponsor.paidAmount / sponsor.value) * 100);

          return (
            <Card key={sponsor.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{sponsor.sponsorName}</CardTitle>
                      <CardDescription>{sponsor.eventName}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${tier.color} text-white`}>
                      {tier.label}
                    </Badge>
                    <Badge className={`${status.color} text-white`}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                    {sponsor.contractSigned && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <FileText className="mr-1 h-3 w-3" />
                        Signed
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Sponsorship</DropdownMenuItem>
                        <DropdownMenuItem>View Contract</DropdownMenuItem>
                        <DropdownMenuItem>Record Payment</DropdownMenuItem>
                        <DropdownMenuItem>Send Invoice</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Sponsorship Value</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(sponsor.value)}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Paid</span>
                        <span className="font-medium">{formatCurrency(sponsor.paidAmount)}</span>
                      </div>
                      <Progress value={paymentProgress} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Duration</span>
                    </div>
                    <p className="text-sm">
                      {formatDate(sponsor.startDate)} - {formatDate(sponsor.endDate)}
                    </p>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Contact: {sponsor.contactName}</p>
                      <p>{sponsor.contactEmail}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Benefits</p>
                    <div className="flex flex-wrap gap-1">
                      {sponsor.benefits.slice(0, 3).map((benefit, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                      {sponsor.benefits.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{sponsor.benefits.length - 3} more
                        </Badge>
                      )}
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
