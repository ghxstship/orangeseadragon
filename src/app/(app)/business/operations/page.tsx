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
  Ticket,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";

interface TicketType {
  id: string;
  name: string;
  eventName: string;
  eventDate: string;
  price: number;
  capacity: number;
  sold: number;
  status: "on_sale" | "sold_out" | "off_sale" | "scheduled";
  salesStart: string;
  salesEnd: string;
}

const ticketTypes: TicketType[] = [
  {
    id: "1",
    name: "General Admission",
    eventName: "Summer Festival 2024",
    eventDate: "2024-06-15",
    price: 75,
    capacity: 15000,
    sold: 12500,
    status: "on_sale",
    salesStart: "2024-01-01",
    salesEnd: "2024-06-15",
  },
  {
    id: "2",
    name: "VIP Pass",
    eventName: "Summer Festival 2024",
    eventDate: "2024-06-15",
    price: 250,
    capacity: 2000,
    sold: 2000,
    status: "sold_out",
    salesStart: "2024-01-01",
    salesEnd: "2024-06-15",
  },
  {
    id: "3",
    name: "Weekend Pass",
    eventName: "Summer Festival 2024",
    eventDate: "2024-06-15",
    price: 150,
    capacity: 5000,
    sold: 4200,
    status: "on_sale",
    salesStart: "2024-01-01",
    salesEnd: "2024-06-14",
  },
  {
    id: "4",
    name: "Early Bird",
    eventName: "Tech Conference 2024",
    eventDate: "2024-09-10",
    price: 199,
    capacity: 500,
    sold: 500,
    status: "sold_out",
    salesStart: "2024-01-01",
    salesEnd: "2024-03-31",
  },
  {
    id: "5",
    name: "Standard Admission",
    eventName: "Tech Conference 2024",
    eventDate: "2024-09-10",
    price: 299,
    capacity: 1500,
    sold: 850,
    status: "on_sale",
    salesStart: "2024-04-01",
    salesEnd: "2024-09-09",
  },
  {
    id: "6",
    name: "Gala Dinner Ticket",
    eventName: "Corporate Gala 2024",
    eventDate: "2024-03-20",
    price: 500,
    capacity: 400,
    sold: 385,
    status: "on_sale",
    salesStart: "2024-01-15",
    salesEnd: "2024-03-15",
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  on_sale: { label: "On Sale", color: "bg-green-500" },
  sold_out: { label: "Sold Out", color: "bg-red-500" },
  off_sale: { label: "Off Sale", color: "bg-gray-500" },
  scheduled: { label: "Scheduled", color: "bg-blue-500" },
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

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function TicketingPage() {
  const totalCapacity = ticketTypes.reduce((acc, t) => acc + t.capacity, 0);
  const totalSold = ticketTypes.reduce((acc, t) => acc + t.sold, 0);
  const totalRevenue = ticketTypes.reduce((acc, t) => acc + t.sold * t.price, 0);

  const stats = {
    totalTypes: ticketTypes.length,
    totalSold,
    totalRevenue,
    sellThrough: Math.round((totalSold / totalCapacity) * 100),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticketing</h1>
          <p className="text-muted-foreground">
            Manage ticket types and sales
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Ticket Type
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTypes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tickets Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalSold)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sell-Through Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sellThrough}%</div>
            <Progress value={stats.sellThrough} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tickets..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {ticketTypes.map((ticket) => {
          const status = statusConfig[ticket.status];
          const soldPercentage = Math.round((ticket.sold / ticket.capacity) * 100);
          const revenue = ticket.sold * ticket.price;

          return (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{ticket.name}</h3>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                        <Badge variant="outline" className="font-mono">
                          {formatCurrency(ticket.price)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{ticket.eventName}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(ticket.eventDate)}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            Sales Progress
                          </span>
                          <span className="font-medium">
                            {formatNumber(ticket.sold)} / {formatNumber(ticket.capacity)}
                          </span>
                        </div>
                        <Progress value={soldPercentage} className="h-2" />
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Sales: {formatDate(ticket.salesStart)} - {formatDate(ticket.salesEnd)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xl font-bold text-green-500">
                        <DollarSign className="h-5 w-5" />
                        {formatNumber(revenue)}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <TrendingUp className="h-3 w-3" />
                        {soldPercentage}% sold
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
                        <DropdownMenuItem>Edit Ticket Type</DropdownMenuItem>
                        <DropdownMenuItem>View Sales Report</DropdownMenuItem>
                        {ticket.status === "on_sale" && (
                          <DropdownMenuItem className="text-red-600">Pause Sales</DropdownMenuItem>
                        )}
                        {ticket.status === "off_sale" && (
                          <DropdownMenuItem className="text-green-600">Resume Sales</DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Adjust Capacity</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
