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
  List,
  Calendar,
  Download,
  Mic,
  CheckCircle,
} from "lucide-react";
import { INPUT_LIST_STATUS, type InputListStatus } from "@/lib/enums";

interface InputChannel {
  channel: number;
  source: string;
  mic: string;
  stand: string;
  notes?: string;
}

interface InputList {
  id: string;
  artistName: string;
  eventName: string;
  stage: string;
  totalChannels: number;
  status: InputListStatus;
  lastModified: string;
  channels: InputChannel[];
}

const inputLists: InputList[] = [
  {
    id: "1",
    artistName: "The Headliners",
    eventName: "Summer Festival 2024",
    stage: "Main Stage",
    totalChannels: 48,
    status: INPUT_LIST_STATUS.CONFIRMED,
    lastModified: "2024-01-15",
    channels: [
      { channel: 1, source: "Kick In", mic: "Beta 91A", stand: "Low", notes: "Inside kick" },
      { channel: 2, source: "Kick Out", mic: "Beta 52A", stand: "Short Boom" },
      { channel: 3, source: "Snare Top", mic: "SM57", stand: "Short Boom" },
      { channel: 4, source: "Snare Bottom", mic: "SM57", stand: "Short Boom" },
      { channel: 5, source: "Hi-Hat", mic: "KSM137", stand: "Short Boom" },
      { channel: 6, source: "Rack Tom", mic: "E604", stand: "Clip" },
      { channel: 7, source: "Floor Tom", mic: "E604", stand: "Clip" },
      { channel: 8, source: "OH L", mic: "KSM32", stand: "Tall Boom" },
      { channel: 9, source: "OH R", mic: "KSM32", stand: "Tall Boom" },
      { channel: 10, source: "Bass DI", mic: "DI", stand: "-" },
    ],
  },
  {
    id: "2",
    artistName: "DJ Pulse",
    eventName: "Summer Festival 2024",
    stage: "Electronic Stage",
    totalChannels: 8,
    status: INPUT_LIST_STATUS.CONFIRMED,
    lastModified: "2024-01-14",
    channels: [
      { channel: 1, source: "CDJ 1 L", mic: "DI", stand: "-" },
      { channel: 2, source: "CDJ 1 R", mic: "DI", stand: "-" },
      { channel: 3, source: "CDJ 2 L", mic: "DI", stand: "-" },
      { channel: 4, source: "CDJ 2 R", mic: "DI", stand: "-" },
      { channel: 5, source: "Mixer L", mic: "DI", stand: "-" },
      { channel: 6, source: "Mixer R", mic: "DI", stand: "-" },
      { channel: 7, source: "MC Vocal", mic: "SM58", stand: "Straight" },
      { channel: 8, source: "Spare", mic: "SM58", stand: "Straight" },
    ],
  },
  {
    id: "3",
    artistName: "Sarah Songbird",
    eventName: "Corporate Gala 2024",
    stage: "Grand Ballroom",
    totalChannels: 12,
    status: INPUT_LIST_STATUS.LOCKED,
    lastModified: "2024-01-10",
    channels: [
      { channel: 1, source: "Vocal", mic: "Beta 87A", stand: "Straight" },
      { channel: 2, source: "Acoustic Guitar", mic: "DI + KSM137", stand: "Short Boom" },
      { channel: 3, source: "Piano L", mic: "DI", stand: "-" },
      { channel: 4, source: "Piano R", mic: "DI", stand: "-" },
    ],
  },
];

const statusConfig: Record<InputListStatus, { label: string; color: string }> = {
  [INPUT_LIST_STATUS.DRAFT]: { label: "Draft", color: "bg-gray-500" },
  [INPUT_LIST_STATUS.CONFIRMED]: { label: "Confirmed", color: "bg-green-500" },
  [INPUT_LIST_STATUS.LOCKED]: { label: "Locked", color: "bg-blue-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InputListsPage() {
  const [expandedList, setExpandedList] = React.useState<string | null>("1");

  const stats = {
    totalLists: inputLists.length,
    totalChannels: inputLists.reduce((acc, l) => acc + l.totalChannels, 0),
    confirmed: inputLists.filter((l) => l.status === INPUT_LIST_STATUS.CONFIRMED || l.status === INPUT_LIST_STATUS.LOCKED).length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Input Lists"
        description="Manage audio channel assignments"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Input List
          </Button>
        }
      />

      <StatGrid columns={3}>
        <StatCard
          title="Total Lists"
          value={stats.totalLists}
          icon={List}
        />
        <StatCard
          title="Total Channels"
          value={stats.totalChannels}
          icon={Mic}
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
          <Input placeholder="Search input lists..." className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        {inputLists.map((list) => {
          const status = statusConfig[list.status];
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
                      <List className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{list.artistName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {list.eventName} • {list.stage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                        <Badge variant="outline">{list.totalChannels} CH</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(list.lastModified)}
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
                        {list.status === INPUT_LIST_STATUS.DRAFT && (
                          <DropdownMenuItem className="text-green-600">Confirm</DropdownMenuItem>
                        )}
                        {list.status === INPUT_LIST_STATUS.CONFIRMED && (
                          <DropdownMenuItem className="text-blue-600">Lock</DropdownMenuItem>
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
                          <th className="text-left p-3 font-medium w-32">Mic/DI</th>
                          <th className="text-left p-3 font-medium w-32">Stand</th>
                          <th className="text-left p-3 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.channels.map((channel) => (
                          <tr key={channel.channel} className="border-t hover:bg-muted/30">
                            <td className="p-3 font-mono font-medium">{channel.channel}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Mic className="h-4 w-4 text-muted-foreground" />
                                {channel.source}
                              </div>
                            </td>
                            <td className="p-3 text-sm">{channel.mic}</td>
                            <td className="p-3 text-sm text-muted-foreground">{channel.stand}</td>
                            <td className="p-3 text-sm text-muted-foreground italic">
                              {channel.notes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Channel
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
