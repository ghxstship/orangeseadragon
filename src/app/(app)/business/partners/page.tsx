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
  Handshake,
  Star,
  Globe,
  CheckCircle,
  Award,
  Layers,
} from "lucide-react";

interface Partner {
  id: string;
  name: string;
  type: "technology" | "reseller" | "integration" | "strategic";
  tier: "platinum" | "gold" | "silver" | "bronze";
  description: string;
  website: string;
  joinedAt: string;
  active: boolean;
}

const partners: Partner[] = [
  {
    id: "1",
    name: "TechCorp Solutions",
    type: "technology",
    tier: "platinum",
    description: "Leading enterprise software provider",
    website: "https://techcorp.example.com",
    joinedAt: "2023-01-15",
    active: true,
  },
  {
    id: "2",
    name: "Global Events Network",
    type: "reseller",
    tier: "gold",
    description: "International event services distributor",
    website: "https://globalevents.example.com",
    joinedAt: "2023-06-20",
    active: true,
  },
  {
    id: "3",
    name: "CloudSync Inc",
    type: "integration",
    tier: "gold",
    description: "Cloud integration and sync services",
    website: "https://cloudsync.example.com",
    joinedAt: "2023-09-10",
    active: true,
  },
  {
    id: "4",
    name: "EventPro Alliance",
    type: "strategic",
    tier: "platinum",
    description: "Strategic partnership for enterprise events",
    website: "https://eventpro.example.com",
    joinedAt: "2022-11-05",
    active: true,
  },
  {
    id: "5",
    name: "Regional Events Co",
    type: "reseller",
    tier: "silver",
    description: "Regional event management services",
    website: "https://regionalevents.example.com",
    joinedAt: "2024-02-15",
    active: false,
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  technology: { label: "Technology", color: "bg-blue-500" },
  reseller: { label: "Reseller", color: "bg-green-500" },
  integration: { label: "Integration", color: "bg-purple-500" },
  strategic: { label: "Strategic", color: "bg-orange-500" },
};

const tierConfig: Record<string, { label: string; color: string }> = {
  platinum: { label: "Platinum", color: "bg-gray-400" },
  gold: { label: "Gold", color: "bg-yellow-500" },
  silver: { label: "Silver", color: "bg-gray-300" },
  bronze: { label: "Bronze", color: "bg-orange-700" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function PartnersPage() {
  const activeCount = partners.filter((p) => p.active).length;
  const platinumCount = partners.filter((p) => p.tier === "platinum").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners"
        description="Partner network and relationships"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Partner
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Partners"
          value={partners.length}
          icon={Handshake}
        />
        <StatCard
          title="Active"
          value={activeCount}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Platinum"
          value={platinumCount}
          icon={Award}
        />
        <StatCard
          title="Partner Types"
          value={4}
          icon={Layers}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search partners..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            Partner Network
          </CardTitle>
          <CardDescription>All partners and relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {partners.map((partner) => {
              const type = typeConfig[partner.type];
              const tier = tierConfig[partner.tier];

              return (
                <div key={partner.id} className={`p-4 border rounded-lg ${!partner.active ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{partner.name}</h4>
                        {!partner.active && (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${type.color} text-white`}>{type.label}</Badge>
                        <Badge className={`${tier.color} text-white`}>
                          <Star className="mr-1 h-3 w-3" />
                          {tier.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{partner.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Since {formatDate(partner.joinedAt)}</span>
                        <a href={partner.website} className="flex items-center gap-1 text-primary hover:underline">
                          <Globe className="h-3 w-3" />
                          Website
                        </a>
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Change Tier</DropdownMenuItem>
                        <DropdownMenuItem>{partner.active ? "Deactivate" : "Activate"}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
