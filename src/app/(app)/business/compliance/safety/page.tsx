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
  Search,
  Plus,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Users,
  MapPin,
  Calendar,
} from "lucide-react";

interface SafetyChecklist {
  id: string;
  name: string;
  eventName: string;
  venue: string;
  category: "fire" | "crowd" | "medical" | "security" | "structural" | "electrical";
  completedItems: number;
  totalItems: number;
  status: "not_started" | "in_progress" | "completed" | "failed";
  assignedTo: string;
  dueDate: string;
  lastUpdated: string;
}

const safetyChecklists: SafetyChecklist[] = [
  {
    id: "1",
    name: "Fire Safety Inspection",
    eventName: "Summer Festival 2024",
    venue: "City Arena",
    category: "fire",
    completedItems: 18,
    totalItems: 20,
    status: "in_progress",
    assignedTo: "Fire Marshal Team",
    dueDate: "2024-06-14",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "Crowd Management Plan",
    eventName: "Summer Festival 2024",
    venue: "City Arena",
    category: "crowd",
    completedItems: 15,
    totalItems: 15,
    status: "completed",
    assignedTo: "Security Director",
    dueDate: "2024-06-10",
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    name: "Medical Services Setup",
    eventName: "Summer Festival 2024",
    venue: "City Arena",
    category: "medical",
    completedItems: 8,
    totalItems: 12,
    status: "in_progress",
    assignedTo: "Medical Coordinator",
    dueDate: "2024-06-14",
    lastUpdated: "2024-01-15",
  },
  {
    id: "4",
    name: "Security Perimeter Check",
    eventName: "Summer Festival 2024",
    venue: "City Arena",
    category: "security",
    completedItems: 0,
    totalItems: 25,
    status: "not_started",
    assignedTo: "Security Team Lead",
    dueDate: "2024-06-14",
    lastUpdated: "2024-01-10",
  },
  {
    id: "5",
    name: "Structural Integrity Review",
    eventName: "Summer Festival 2024",
    venue: "City Arena",
    category: "structural",
    completedItems: 10,
    totalItems: 10,
    status: "completed",
    assignedTo: "Structural Engineer",
    dueDate: "2024-06-01",
    lastUpdated: "2024-01-12",
  },
  {
    id: "6",
    name: "Electrical Safety Audit",
    eventName: "Summer Festival 2024",
    venue: "City Arena",
    category: "electrical",
    completedItems: 5,
    totalItems: 18,
    status: "in_progress",
    assignedTo: "Electrical Contractor",
    dueDate: "2024-06-13",
    lastUpdated: "2024-01-15",
  },
];

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  fire: { label: "Fire Safety", color: "bg-red-500", icon: AlertTriangle },
  crowd: { label: "Crowd Management", color: "bg-blue-500", icon: Users },
  medical: { label: "Medical", color: "bg-green-500", icon: Shield },
  security: { label: "Security", color: "bg-purple-500", icon: Shield },
  structural: { label: "Structural", color: "bg-orange-500", icon: FileText },
  electrical: { label: "Electrical", color: "bg-yellow-500", icon: AlertTriangle },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  not_started: { label: "Not Started", color: "bg-gray-500", icon: FileText },
  in_progress: { label: "In Progress", color: "bg-blue-500", icon: FileText },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-red-500", icon: AlertTriangle },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SafetyPage() {
  const stats = {
    totalChecklists: safetyChecklists.length,
    completed: safetyChecklists.filter((c) => c.status === "completed").length,
    inProgress: safetyChecklists.filter((c) => c.status === "in_progress").length,
    overallProgress: Math.round(
      (safetyChecklists.reduce((acc, c) => acc + c.completedItems, 0) /
        safetyChecklists.reduce((acc, c) => acc + c.totalItems, 0)) *
        100
    ),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Safety</h1>
          <p className="text-muted-foreground">
            Safety checklists and compliance tracking
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Checklist
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Checklists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChecklists}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallProgress}%</div>
            <Progress value={stats.overallProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search safety checklists..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {safetyChecklists.map((checklist) => {
          const category = categoryConfig[checklist.category];
          const status = statusConfig[checklist.status];
          const CategoryIcon = category.icon;
          const StatusIcon = status.icon;
          const progress = Math.round((checklist.completedItems / checklist.totalItems) * 100);

          return (
            <Card key={checklist.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${category.color}`}>
                      <CategoryIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{checklist.name}</CardTitle>
                      <CardDescription>{checklist.eventName}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${status.color} text-white`}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {checklist.completedItems} / {checklist.totalItems} items
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{checklist.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{checklist.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDate(checklist.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Updated: {formatDate(checklist.lastUpdated)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Checklist
                    </Button>
                    {checklist.status !== "completed" && (
                      <Button size="sm" className="flex-1">
                        Continue
                      </Button>
                    )}
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
