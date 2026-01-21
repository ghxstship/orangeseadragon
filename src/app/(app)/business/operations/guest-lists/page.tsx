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
  Users,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Download,
  Mail,
  Ticket,
} from "lucide-react";

interface GuestEntry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plusOnes: number;
  status: "pending" | "confirmed" | "checked_in" | "no_show" | "cancelled";
  vipLevel?: "standard" | "vip" | "vvip";
  notes?: string;
  addedBy: string;
}

interface GuestList {
  id: string;
  eventName: string;
  eventDate: string;
  totalCapacity: number;
  entries: GuestEntry[];
}

const guestLists: GuestList[] = [
  {
    id: "1",
    eventName: "Summer Festival 2024 - VIP Night",
    eventDate: "2024-06-15",
    totalCapacity: 500,
    entries: [
      { id: "1a", name: "John Smith", email: "john@example.com", phone: "+1 555-0101", plusOnes: 2, status: "confirmed", vipLevel: "vvip", addedBy: "Sarah Chen" },
      { id: "1b", name: "Emily Johnson", email: "emily@example.com", plusOnes: 1, status: "confirmed", vipLevel: "vip", addedBy: "Sarah Chen" },
      { id: "1c", name: "Michael Brown", email: "michael@example.com", plusOnes: 0, status: "pending", vipLevel: "standard", addedBy: "Mike Johnson" },
      { id: "1d", name: "Sarah Williams", email: "sarah@example.com", phone: "+1 555-0104", plusOnes: 3, status: "checked_in", vipLevel: "vip", addedBy: "Sarah Chen" },
      { id: "1e", name: "David Lee", email: "david@example.com", plusOnes: 1, status: "cancelled", vipLevel: "standard", addedBy: "Tom Wilson" },
    ],
  },
  {
    id: "2",
    eventName: "Corporate Gala 2024",
    eventDate: "2024-03-20",
    totalCapacity: 200,
    entries: [
      { id: "2a", name: "Jennifer Davis", email: "jennifer@techcorp.com", plusOnes: 1, status: "confirmed", vipLevel: "vip", addedBy: "Lisa Park" },
      { id: "2b", name: "Robert Wilson", email: "robert@techcorp.com", plusOnes: 0, status: "confirmed", vipLevel: "standard", addedBy: "Lisa Park" },
      { id: "2c", name: "Amanda Martinez", email: "amanda@partner.com", plusOnes: 1, status: "pending", vipLevel: "vip", addedBy: "David Kim" },
    ],
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-green-500", icon: CheckCircle },
  checked_in: { label: "Checked In", color: "bg-blue-500", icon: CheckCircle },
  no_show: { label: "No Show", color: "bg-gray-500", icon: XCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
};

const vipConfig: Record<string, { label: string; color: string }> = {
  standard: { label: "Standard", color: "bg-gray-500" },
  vip: { label: "VIP", color: "bg-purple-500" },
  vvip: { label: "VVIP", color: "bg-amber-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function GuestListsPage() {
  const [selectedList, setSelectedList] = React.useState<string>("1");
  const currentList = guestLists.find((l) => l.id === selectedList);

  const stats = currentList ? {
    totalGuests: currentList.entries.length,
    totalWithPlusOnes: currentList.entries.reduce((acc, e) => acc + 1 + e.plusOnes, 0),
    confirmed: currentList.entries.filter((e) => e.status === "confirmed" || e.status === "checked_in").length,
    checkedIn: currentList.entries.filter((e) => e.status === "checked_in").length,
  } : { totalGuests: 0, totalWithPlusOnes: 0, confirmed: 0, checkedIn: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guest Lists"
        description="Manage event guest lists and check-ins"
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Guest
            </Button>
          </div>
        }
      />

      <div className="flex gap-2 flex-wrap">
        {guestLists.map((list) => (
          <Button
            key={list.id}
            variant={selectedList === list.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedList(list.id)}
          >
            {list.eventName}
          </Button>
        ))}
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New List
        </Button>
      </div>

      {currentList && (
        <>
          <StatGrid columns={4}>
            <StatCard
              title="Total Guests"
              value={stats.totalGuests}
              icon={Users}
            />
            <StatCard
              title="Confirmed"
              value={stats.confirmed}
              valueClassName="text-green-500"
              icon={CheckCircle}
            />
            <StatCard
              title="Checked In"
              value={stats.checkedIn}
              valueClassName="text-blue-500"
              icon={CheckCircle}
            />
            <StatCard
              title="Capacity"
              value={`${stats.totalWithPlusOnes} / ${currentList.totalCapacity}`}
              icon={Ticket}
            />
          </StatGrid>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentList.eventName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(currentList.eventDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search guests..." className="pl-9 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invites
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 text-sm">
                      <th className="text-left p-3 font-medium">Guest</th>
                      <th className="text-left p-3 font-medium">Contact</th>
                      <th className="text-left p-3 font-medium">+1s</th>
                      <th className="text-left p-3 font-medium">VIP Level</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Added By</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentList.entries.map((entry) => {
                      const status = statusConfig[entry.status];
                      const vip = vipConfig[entry.vipLevel || "standard"];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={entry.id} className="border-t hover:bg-muted/30">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(entry.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{entry.name}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">{entry.email}</div>
                            {entry.phone && (
                              <div className="text-xs text-muted-foreground">{entry.phone}</div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{entry.plusOnes}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={`${vip.color} text-white`}>
                              {vip.label}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={`${status.color} text-white`}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {entry.addedBy}
                          </td>
                          <td className="p-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Check In
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit Guest</DropdownMenuItem>
                                <DropdownMenuItem>Send Confirmation</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
