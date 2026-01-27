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
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common";
import {
  Search,
  Plus,
  Calendar,
  Users,
  FileText,
  DollarSign,
  Building,
  Mail,
  Upload,
  Download,
  Settings,
  BarChart,
  Clock,
  Zap,
} from "lucide-react";

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: string;
}

const quickActions: QuickAction[] = [
  {
    id: "1",
    name: "Create Event",
    description: "Start planning a new event",
    icon: Calendar,
    color: "bg-blue-500",
    category: "Events",
  },
  {
    id: "2",
    name: "Add Contact",
    description: "Add a new contact to your database",
    icon: Users,
    color: "bg-green-500",
    category: "Contacts",
  },
  {
    id: "3",
    name: "Create Invoice",
    description: "Generate a new invoice",
    icon: DollarSign,
    color: "bg-orange-500",
    category: "Finance",
  },
  {
    id: "4",
    name: "Add Vendor",
    description: "Register a new vendor",
    icon: Building,
    color: "bg-purple-500",
    category: "Vendors",
  },
  {
    id: "5",
    name: "Send Email",
    description: "Compose and send an email",
    icon: Mail,
    color: "bg-pink-500",
    category: "Communication",
  },
  {
    id: "6",
    name: "Upload Document",
    description: "Upload files and documents",
    icon: Upload,
    color: "bg-cyan-500",
    category: "Documents",
  },
  {
    id: "7",
    name: "Export Data",
    description: "Export data to CSV or Excel",
    icon: Download,
    color: "bg-emerald-500",
    category: "Data",
  },
  {
    id: "8",
    name: "Generate Report",
    description: "Create a custom report",
    icon: BarChart,
    color: "bg-indigo-500",
    category: "Reports",
  },
  {
    id: "9",
    name: "Schedule Task",
    description: "Create a new scheduled task",
    icon: Clock,
    color: "bg-yellow-500",
    category: "Tasks",
  },
  {
    id: "10",
    name: "Create Document",
    description: "Create a new document",
    icon: FileText,
    color: "bg-gray-500",
    category: "Documents",
  },
  {
    id: "11",
    name: "Quick Settings",
    description: "Access common settings",
    icon: Settings,
    color: "bg-slate-500",
    category: "Settings",
  },
  {
    id: "12",
    name: "Run Automation",
    description: "Trigger an automation workflow",
    icon: Zap,
    color: "bg-amber-500",
    category: "Automation",
  },
];

const recentActions = [
  { name: "Create Event", time: "2 hours ago" },
  { name: "Add Contact", time: "3 hours ago" },
  { name: "Generate Report", time: "Yesterday" },
  { name: "Export Data", time: "Yesterday" },
];

export default function QuickActionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quick Actions"
        description="Frequently used actions at your fingertips"
      />

      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search actions..." className="pl-10 h-12 text-lg" />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>All Actions</CardTitle>
              <CardDescription>Click to perform an action</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-auto py-4 flex-col items-start text-left"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{action.name}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActions.map((action, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                    <span className="text-sm font-medium">{action.name}</span>
                    <span className="text-xs text-muted-foreground">{action.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Favorites</CardTitle>
              <CardDescription>Your pinned actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                  Create Event
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4 text-green-500" />
                  Add Contact
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4 text-orange-500" />
                  Create Invoice
                </Button>
              </div>
              <Button variant="ghost" className="w-full mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Favorite
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
