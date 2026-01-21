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
import {
  Search,
  MoreHorizontal,
  Trash2,
  RotateCcw,
  Clock,
  Calendar,
  FileText,
  Users,
  Building,
  AlertTriangle,
} from "lucide-react";

interface DeletedItem {
  id: string;
  name: string;
  type: "event" | "contact" | "vendor" | "invoice" | "document";
  deletedAt: string;
  deletedBy: string;
  expiresAt: string;
  daysRemaining: number;
}

const deletedItems: DeletedItem[] = [
  {
    id: "1",
    name: "Test Event",
    type: "event",
    deletedAt: "2024-06-14",
    deletedBy: "Sarah Chen",
    expiresAt: "2024-07-14",
    daysRemaining: 29,
  },
  {
    id: "2",
    name: "Duplicate Contact",
    type: "contact",
    deletedAt: "2024-06-10",
    deletedBy: "Mike Johnson",
    expiresAt: "2024-07-10",
    daysRemaining: 25,
  },
  {
    id: "3",
    name: "Old Vendor Record",
    type: "vendor",
    deletedAt: "2024-06-05",
    deletedBy: "Emily Watson",
    expiresAt: "2024-07-05",
    daysRemaining: 20,
  },
  {
    id: "4",
    name: "Draft Invoice",
    type: "invoice",
    deletedAt: "2024-05-20",
    deletedBy: "David Park",
    expiresAt: "2024-06-20",
    daysRemaining: 5,
  },
];

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  event: { label: "Event", icon: Calendar, color: "bg-blue-500" },
  contact: { label: "Contact", icon: Users, color: "bg-green-500" },
  vendor: { label: "Vendor", icon: Building, color: "bg-purple-500" },
  invoice: { label: "Invoice", icon: FileText, color: "bg-orange-500" },
  document: { label: "Document", icon: FileText, color: "bg-gray-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RecycleBinPage() {
  const totalDeleted = deletedItems.length;
  const expiringSoon = deletedItems.filter((i) => i.daysRemaining <= 7).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recycle Bin</h1>
          <p className="text-muted-foreground">
            Recover or permanently delete items
          </p>
        </div>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Empty Recycle Bin
        </Button>
      </div>

      {expiringSoon > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <div>
                <h3 className="font-medium">{expiringSoon} item{expiringSoon > 1 ? "s" : ""} expiring soon</h3>
                <p className="text-sm text-muted-foreground">
                  Items are permanently deleted after 30 days in the recycle bin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeleted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{expiringSoon}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Retention Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30 days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Auto-Delete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500 text-white">Enabled</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search deleted items..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deleted Items</CardTitle>
          <CardDescription>Items pending permanent deletion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deletedItems.map((item) => {
              const type = typeConfig[item.type];
              const TypeIcon = type.icon;

              return (
                <div key={item.id} className={`flex items-center justify-between p-4 border rounded-lg ${item.daysRemaining <= 7 ? "border-yellow-500" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${type.color} opacity-60`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge className={`${type.color} text-white`}>
                          {type.label}
                        </Badge>
                        {item.daysRemaining <= 7 && (
                          <Badge className="bg-yellow-500 text-white">
                            <Clock className="mr-1 h-3 w-3" />
                            {item.daysRemaining} days left
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Trash2 className="h-4 w-4" />
                          Deleted: {formatDate(item.deletedAt)}
                        </span>
                        <span>By: {item.deletedBy}</span>
                        <span>Expires: {formatDate(item.expiresAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Restore
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Permanently
                        </DropdownMenuItem>
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
