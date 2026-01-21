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
  DollarSign,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  CreditCard,
  Loader2,
} from "lucide-react";
import { RATE_CARD_STATUS, type RateCardStatus } from "@/lib/enums";
import { formatCurrency as formatCurrencyUtil, DEFAULT_CURRENCY } from "@/lib/config";

interface RateCardItem {
  id: string;
  role: string;
  hourly_rate: number;
  daily_rate: number;
  overtime_multiplier: number;
}

interface RateCard {
  id: string;
  name: string;
  description: string;
  effective_date: string;
  expiry_date?: string;
  status: RateCardStatus;
  client_type: "standard" | "premium" | "enterprise";
  items: RateCardItem[];
}

const statusConfig: Record<RateCardStatus, { label: string; color: string }> = {
  [RATE_CARD_STATUS.DRAFT]: { label: "Draft", color: "bg-gray-500" },
  [RATE_CARD_STATUS.ACTIVE]: { label: "Active", color: "bg-green-500" },
  [RATE_CARD_STATUS.EXPIRED]: { label: "Expired", color: "bg-red-500" },
};

const clientTypeConfig: Record<string, { label: string; color: string }> = {
  standard: { label: "Standard", color: "bg-blue-500" },
  premium: { label: "Premium", color: "bg-purple-500" },
  enterprise: { label: "Enterprise", color: "bg-orange-500" },
};

function formatCurrency(amount: number): string {
  return formatCurrencyUtil(amount, DEFAULT_CURRENCY);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RateCardsPage() {
  const [rateCards, setRateCards] = React.useState<RateCard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedCard, setExpandedCard] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchRateCards() {
      try {
        const response = await fetch("/api/v1/rate-cards");
        if (response.ok) {
          const result = await response.json();
          setRateCards(result.data || []);
          if (result.data?.length > 0) {
            setExpandedCard(result.data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch rate cards:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRateCards();
  }, []);

  const activeCards = rateCards.filter((c) => c.status === RATE_CARD_STATUS.ACTIVE).length;
  const totalRoles = rateCards.reduce((acc, c) => acc + (c.items?.length || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rate Cards"
        description="Manage crew and service pricing"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Rate Card
          </Button>
        }
      />

      <StatGrid columns={3}>
        <StatCard
          title="Total Rate Cards"
          value={rateCards.length}
          icon={CreditCard}
        />
        <StatCard
          title="Active"
          value={activeCards}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Total Roles Defined"
          value={totalRoles}
          icon={Users}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search rate cards..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {rateCards.map((rateCard) => {
          const status = statusConfig[rateCard.status];
          const clientType = clientTypeConfig[rateCard.client_type];
          const isExpanded = expandedCard === rateCard.id;

          return (
            <Card key={rateCard.id} className={`hover:shadow-md transition-shadow ${rateCard.status === RATE_CARD_STATUS.EXPIRED ? "opacity-60" : ""}`}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedCard(isExpanded ? null : rateCard.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>{rateCard.name}</CardTitle>
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                      <Badge className={`${clientType.color} text-white`}>
                        {clientType.label}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">{rateCard.description}</CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(rateCard.effective_date)}
                        {rateCard.expiry_date && ` - ${formatDate(rateCard.expiry_date)}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {rateCard.items?.length || 0} roles
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Rate Card</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                      {rateCard.status === RATE_CARD_STATUS.DRAFT && (
                        <DropdownMenuItem className="text-green-600">Activate</DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 text-sm">
                          <th className="text-left p-3 font-medium">Role</th>
                          <th className="text-right p-3 font-medium">Hourly Rate</th>
                          <th className="text-right p-3 font-medium">Daily Rate</th>
                          <th className="text-right p-3 font-medium">OT Multiplier</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rateCard.items || []).map((item) => (
                          <tr key={item.id} className="border-t hover:bg-muted/30">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {item.role}
                              </div>
                            </td>
                            <td className="p-3 text-right font-medium">
                              {formatCurrency(item.hourly_rate)}/hr
                            </td>
                            <td className="p-3 text-right font-medium">
                              {formatCurrency(item.daily_rate)}/day
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {item.overtime_multiplier}x
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Role
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
