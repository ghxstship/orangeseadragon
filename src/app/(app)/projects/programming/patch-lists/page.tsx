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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  Plus,
  MoreHorizontal,
  Cable,
  Calendar,
  Download,
  ArrowRight,
  ListTodo,
  CheckCircle,
} from "lucide-react";
import { PATCH_LIST_STATUS, type PatchListStatus } from "@/lib/enums";

interface PatchConnection {
  sourceChannel: number;
  sourceName: string;
  destinationType: "console" | "stagebox" | "splitter";
  destinationChannel: number;
  destinationName: string;
}

interface PatchList {
  id: string;
  name: string;
  eventName: string;
  stage: string;
  systemType: "FOH" | "MON" | "Broadcast" | "Recording";
  totalPatches: number;
  status: PatchListStatus;
  lastModified: string;
  patches: PatchConnection[];
}

const patchLists: PatchList[] = [
  {
    id: "1",
    name: "Main Stage FOH Patch",
    eventName: "Summer Festival 2024",
    stage: "Main Stage",
    systemType: "FOH",
    totalPatches: 48,
    status: PATCH_LIST_STATUS.CONFIRMED,
    lastModified: "2024-01-15",
    patches: [
      { sourceChannel: 1, sourceName: "Kick In", destinationType: "stagebox", destinationChannel: 1, destinationName: "SB1-CH1" },
      { sourceChannel: 2, sourceName: "Kick Out", destinationType: "stagebox", destinationChannel: 2, destinationName: "SB1-CH2" },
      { sourceChannel: 3, sourceName: "Snare Top", destinationType: "stagebox", destinationChannel: 3, destinationName: "SB1-CH3" },
      { sourceChannel: 4, sourceName: "Snare Bot", destinationType: "stagebox", destinationChannel: 4, destinationName: "SB1-CH4" },
      { sourceChannel: 5, sourceName: "Hi-Hat", destinationType: "stagebox", destinationChannel: 5, destinationName: "SB1-CH5" },
      { sourceChannel: 6, sourceName: "Rack Tom", destinationType: "stagebox", destinationChannel: 6, destinationName: "SB1-CH6" },
      { sourceChannel: 7, sourceName: "Floor Tom", destinationType: "stagebox", destinationChannel: 7, destinationName: "SB1-CH7" },
      { sourceChannel: 8, sourceName: "OH L", destinationType: "stagebox", destinationChannel: 8, destinationName: "SB1-CH8" },
    ],
  },
  {
    id: "2",
    name: "Main Stage Monitor Patch",
    eventName: "Summer Festival 2024",
    stage: "Main Stage",
    systemType: "MON",
    totalPatches: 48,
    status: PATCH_LIST_STATUS.CONFIRMED,
    lastModified: "2024-01-15",
    patches: [
      { sourceChannel: 1, sourceName: "Kick In", destinationType: "splitter", destinationChannel: 1, destinationName: "SPL-A1" },
      { sourceChannel: 2, sourceName: "Kick Out", destinationType: "splitter", destinationChannel: 2, destinationName: "SPL-A2" },
      { sourceChannel: 3, sourceName: "Snare Top", destinationType: "splitter", destinationChannel: 3, destinationName: "SPL-A3" },
      { sourceChannel: 4, sourceName: "Snare Bot", destinationType: "splitter", destinationChannel: 4, destinationName: "SPL-A4" },
    ],
  },
  {
    id: "3",
    name: "Broadcast Feed Patch",
    eventName: "Summer Festival 2024",
    stage: "Main Stage",
    systemType: "Broadcast",
    totalPatches: 32,
    status: PATCH_LIST_STATUS.DRAFT,
    lastModified: "2024-01-14",
    patches: [
      { sourceChannel: 1, sourceName: "L Mix", destinationType: "console", destinationChannel: 1, destinationName: "BC-CH1" },
      { sourceChannel: 2, sourceName: "R Mix", destinationType: "console", destinationChannel: 2, destinationName: "BC-CH2" },
    ],
  },
];

const statusConfig: Record<PatchListStatus, { label: string; color: string }> = {
  [PATCH_LIST_STATUS.DRAFT]: { label: "Draft", color: "bg-gray-500" },
  [PATCH_LIST_STATUS.CONFIRMED]: { label: "Confirmed", color: "bg-green-500" },
  [PATCH_LIST_STATUS.ACTIVE]: { label: "Active", color: "bg-blue-500" },
};

const systemTypeConfig: Record<string, { label: string; color: string }> = {
  FOH: { label: "FOH", color: "bg-blue-500" },
  MON: { label: "Monitor", color: "bg-purple-500" },
  Broadcast: { label: "Broadcast", color: "bg-orange-500" },
  Recording: { label: "Recording", color: "bg-red-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PatchListsPage() {
  const [expandedList, setExpandedList] = React.useState<string | null>("1");

  const stats = {
    totalLists: patchLists.length,
    totalPatches: patchLists.reduce((acc, l) => acc + l.totalPatches, 0),
    confirmed: patchLists.filter((l) => l.status === PATCH_LIST_STATUS.CONFIRMED || l.status === PATCH_LIST_STATUS.ACTIVE).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patch Lists"
        description="Manage audio system patching"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Patch List
          </Button>
        }
      />

      <StatGrid columns={3}>
        <StatCard
          title="Total Lists"
          value={stats.totalLists}
          icon={ListTodo}
        />
        <StatCard
          title="Total Patches"
          value={stats.totalPatches}
          icon={Cable}
        />
        <StatCard
          title="Confirmed"
          value={stats.confirmed}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patch lists..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {patchLists.map((list) => {
          const status = statusConfig[list.status];
          const systemType = systemTypeConfig[list.systemType];
          const isExpanded = expandedList === list.id;

          return (
            <Card key={list.id} className="hover:shadow-md transition-shadow">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedList(isExpanded ? null : list.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Cable className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{list.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {list.eventName} • {list.stage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge className={`${systemType.color} text-white`}>
                          {systemType.label}
                        </Badge>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(list.lastModified)} • {list.totalPatches} patches
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit List</DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        {list.status === PATCH_LIST_STATUS.DRAFT && (
                          <DropdownMenuItem className="text-green-600">Confirm</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 text-sm">
                          <th className="text-left p-3 font-medium w-16">CH</th>
                          <th className="text-left p-3 font-medium">Source</th>
                          <th className="text-center p-3 font-medium w-16"></th>
                          <th className="text-left p-3 font-medium">Destination</th>
                          <th className="text-left p-3 font-medium w-24">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.patches.map((patch) => (
                          <tr key={patch.sourceChannel} className="border-t hover:bg-muted/30">
                            <td className="p-3 font-mono font-medium">{patch.sourceChannel}</td>
                            <td className="p-3">{patch.sourceName}</td>
                            <td className="p-3 text-center">
                              <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />
                            </td>
                            <td className="p-3 font-mono">{patch.destinationName}</td>
                            <td className="p-3">
                              <Badge variant="outline" className="text-xs capitalize">
                                {patch.destinationType}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Patch
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
