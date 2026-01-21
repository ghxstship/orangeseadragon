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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Clock,
  Calendar,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { RUNSHEET_STATUS, RUNSHEET_ITEM_STATUS, type RunsheetStatus, type RunsheetItemStatus } from "@/lib/enums";

interface RunsheetItem {
  id: string;
  time: string;
  duration: number;
  title: string;
  description: string;
  responsible: string;
  status: RunsheetItemStatus;
  notes?: string;
}

interface Runsheet {
  id: string;
  eventName: string;
  eventDate: string;
  stage: string;
  status: RunsheetStatus;
  items: RunsheetItem[];
}

const runsheets: Runsheet[] = [
  {
    id: "1",
    eventName: "Summer Festival 2024 - Day 1",
    eventDate: "2024-06-15",
    stage: "Main Stage",
    status: RUNSHEET_STATUS.DRAFT,
    items: [
      { id: "1a", time: "06:00", duration: 120, title: "Load In & Setup", description: "Crew arrival and equipment setup", responsible: "Production Team", status: RUNSHEET_ITEM_STATUS.PENDING },
      { id: "1b", time: "08:00", duration: 60, title: "Sound Check - Opening Act", description: "Line check and sound check for opening act", responsible: "Audio Team", status: RUNSHEET_ITEM_STATUS.PENDING },
      { id: "1c", time: "09:00", duration: 60, title: "Lighting Programming", description: "Final lighting cue programming", responsible: "Lighting Team", status: RUNSHEET_ITEM_STATUS.PENDING },
      { id: "1d", time: "10:00", duration: 30, title: "Safety Briefing", description: "All crew safety briefing", responsible: "Stage Manager", status: RUNSHEET_ITEM_STATUS.PENDING },
      { id: "1e", time: "12:00", duration: 60, title: "Doors Open", description: "Public entry begins", responsible: "FOH Team", status: RUNSHEET_ITEM_STATUS.PENDING },
      { id: "1f", time: "13:00", duration: 45, title: "Opening Act Performance", description: "First performance of the day", responsible: "Stage Manager", status: RUNSHEET_ITEM_STATUS.PENDING },
    ],
  },
  {
    id: "2",
    eventName: "Corporate Gala 2024",
    eventDate: "2024-03-20",
    stage: "Grand Ballroom",
    status: RUNSHEET_STATUS.ACTIVE,
    items: [
      { id: "2a", time: "14:00", duration: 120, title: "Venue Setup", description: "Table setup and decoration", responsible: "Events Team", status: RUNSHEET_ITEM_STATUS.COMPLETED },
      { id: "2b", time: "16:00", duration: 60, title: "AV Check", description: "Projector and audio system check", responsible: "AV Team", status: RUNSHEET_ITEM_STATUS.COMPLETED },
      { id: "2c", time: "17:00", duration: 60, title: "Catering Setup", description: "Food stations and bar setup", responsible: "Catering", status: RUNSHEET_ITEM_STATUS.IN_PROGRESS },
      { id: "2d", time: "18:00", duration: 30, title: "Final Walkthrough", description: "Client final approval", responsible: "Event Manager", status: RUNSHEET_ITEM_STATUS.PENDING },
      { id: "2e", time: "18:30", duration: 30, title: "Guest Arrival", description: "Welcome drinks and registration", responsible: "Host Team", status: RUNSHEET_ITEM_STATUS.PENDING },
    ],
  },
  {
    id: "3",
    eventName: "Tech Conference 2024 - Day 1",
    eventDate: "2024-09-10",
    stage: "Main Hall",
    status: RUNSHEET_STATUS.DRAFT,
    items: [
      { id: "3a", time: "07:00", duration: 60, title: "Registration Setup", description: "Badge printing and desk setup", responsible: "Registration Team", status: RUNSHEET_ITEM_STATUS.PENDING },
      { id: "3b", time: "08:00", duration: 60, title: "Speaker Check-in", description: "Speaker arrival and green room", responsible: "Speaker Liaison", status: RUNSHEET_ITEM_STATUS.PENDING },
      { id: "3c", time: "09:00", duration: 30, title: "Opening Keynote", description: "CEO welcome address", responsible: "Stage Manager", status: RUNSHEET_ITEM_STATUS.PENDING },
    ],
  },
];

const statusConfig: Record<RunsheetItemStatus, { label: string; color: string; icon: React.ElementType }> = {
  [RUNSHEET_ITEM_STATUS.PENDING]: { label: "Pending", color: "bg-gray-500", icon: Clock },
  [RUNSHEET_ITEM_STATUS.IN_PROGRESS]: { label: "In Progress", color: "bg-blue-500", icon: Play },
  [RUNSHEET_ITEM_STATUS.COMPLETED]: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  [RUNSHEET_ITEM_STATUS.DELAYED]: { label: "Delayed", color: "bg-red-500", icon: AlertCircle },
  [RUNSHEET_ITEM_STATUS.SKIPPED]: { label: "Skipped", color: "bg-yellow-500", icon: AlertCircle },
};

const runsheetStatusConfig: Record<RunsheetStatus, { label: string; color: string }> = {
  [RUNSHEET_STATUS.DRAFT]: { label: "Draft", color: "bg-gray-500" },
  [RUNSHEET_STATUS.APPROVED]: { label: "Approved", color: "bg-blue-500" },
  [RUNSHEET_STATUS.ACTIVE]: { label: "Active", color: "bg-green-500" },
  [RUNSHEET_STATUS.LOCKED]: { label: "Locked", color: "bg-purple-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function RunsheetsPage() {
  const [expandedRunsheet, setExpandedRunsheet] = React.useState<string | null>("2");

  const stats = {
    totalRunsheets: runsheets.length,
    activeRunsheets: runsheets.filter((r) => r.status === RUNSHEET_STATUS.ACTIVE).length,
    totalItems: runsheets.reduce((acc, r) => acc + r.items.length, 0),
    completedItems: runsheets.reduce((acc, r) => acc + r.items.filter((i) => i.status === RUNSHEET_ITEM_STATUS.COMPLETED).length, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Runsheets</h1>
          <p className="text-muted-foreground">
            Event schedules and show flow management
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Runsheet
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Runsheets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRunsheets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.activeRunsheets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.completedItems}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search runsheets..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {runsheets.map((runsheet) => {
          const rsStatus = runsheetStatusConfig[runsheet.status];
          const isExpanded = expandedRunsheet === runsheet.id;
          const completedCount = runsheet.items.filter((i) => i.status === RUNSHEET_ITEM_STATUS.COMPLETED).length;

          return (
            <Card key={runsheet.id} className="hover:shadow-md transition-shadow">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedRunsheet(isExpanded ? null : runsheet.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{runsheet.eventName}</CardTitle>
                      <Badge className={`${rsStatus.color} text-white`}>
                        {rsStatus.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(runsheet.eventDate)}
                      </span>
                      <span>{runsheet.stage}</span>
                      <span>{completedCount} / {runsheet.items.length} items completed</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Runsheet</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Export PDF</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      {runsheet.status === RUNSHEET_STATUS.DRAFT && (
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
                          <th className="text-left p-3 font-medium w-20">Time</th>
                          <th className="text-left p-3 font-medium w-20">Duration</th>
                          <th className="text-left p-3 font-medium">Item</th>
                          <th className="text-left p-3 font-medium">Responsible</th>
                          <th className="text-left p-3 font-medium w-28">Status</th>
                          <th className="p-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {runsheet.items.map((item) => {
                          const itemStatus = statusConfig[item.status];
                          const StatusIcon = itemStatus.icon;
                          return (
                            <tr key={item.id} className="border-t hover:bg-muted/30">
                              <td className="p-3 font-mono text-sm">{item.time}</td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {formatDuration(item.duration)}
                              </td>
                              <td className="p-3">
                                <div className="font-medium">{item.title}</div>
                                <div className="text-sm text-muted-foreground">{item.description}</div>
                              </td>
                              <td className="p-3 text-sm">{item.responsible}</td>
                              <td className="p-3">
                                <Badge className={`${itemStatus.color} text-white`}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {itemStatus.label}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Play className="mr-2 h-4 w-4" />
                                      Start
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Complete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Pause className="mr-2 h-4 w-4" />
                                      Mark Delayed
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Edit</DropdownMenuItem>
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
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
