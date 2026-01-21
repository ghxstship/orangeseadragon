"use client";

import * as React from "react";
import { Loader2, Plus, Search, Filter, Music, Calendar, Clock, MoreHorizontal, GripVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type SetlistStatus = "draft" | "submitted" | "approved" | "performed";

const SETLIST_STATUS = {
  DRAFT: "draft" as SetlistStatus,
  SUBMITTED: "submitted" as SetlistStatus,
  APPROVED: "approved" as SetlistStatus,
  PERFORMED: "performed" as SetlistStatus,
};

interface SetlistItem {
  id: string;
  position: number;
  songTitle: string;
  duration: number;
  notes?: string;
}

interface Setlist {
  id: string;
  artistName: string;
  eventName: string;
  eventDate: string;
  stage: string;
  setDuration: number;
  status: SetlistStatus;
  items: SetlistItem[];
}

const setlists: Setlist[] = [
  {
    id: "1",
    artistName: "The Headliners",
    eventName: "Summer Festival 2024",
    eventDate: "2024-06-15",
    stage: "Main Stage",
    setDuration: 90,
    status: SETLIST_STATUS.APPROVED,
    items: [
      { id: "1a", position: 1, songTitle: "Opening Anthem", duration: 5, notes: "Pyro on intro" },
      { id: "1b", position: 2, songTitle: "Hit Single #1", duration: 4 },
      { id: "1c", position: 3, songTitle: "New Album Track", duration: 5, notes: "Extended outro" },
      { id: "1d", position: 4, songTitle: "Crowd Favorite", duration: 4 },
      { id: "1e", position: 5, songTitle: "Acoustic Interlude", duration: 6, notes: "Solo performance" },
      { id: "1f", position: 6, songTitle: "Classic Hit", duration: 5 },
    ],
  },
  {
    id: "2",
    artistName: "DJ Pulse",
    eventName: "Summer Festival 2024",
    eventDate: "2024-06-15",
    stage: "Electronic Stage",
    setDuration: 60,
    status: SETLIST_STATUS.DRAFT,
    items: [
      { id: "2a", position: 1, songTitle: "Intro Mix", duration: 8 },
      { id: "2b", position: 2, songTitle: "Build Up", duration: 10 },
      { id: "2c", position: 3, songTitle: "Main Drop", duration: 12, notes: "CO2 cannons" },
      { id: "2d", position: 4, songTitle: "Guest Vocal Track", duration: 8 },
      { id: "2e", position: 5, songTitle: "Closing Set", duration: 15 },
    ],
  },
  {
    id: "3",
    artistName: "Sarah Songbird",
    eventName: "Corporate Gala 2024",
    eventDate: "2024-03-20",
    stage: "Grand Ballroom",
    setDuration: 45,
    status: SETLIST_STATUS.PERFORMED,
    items: [
      { id: "3a", position: 1, songTitle: "Welcome Song", duration: 4 },
      { id: "3b", position: 2, songTitle: "Jazz Standard", duration: 5 },
      { id: "3c", position: 3, songTitle: "Original Composition", duration: 6 },
      { id: "3d", position: 4, songTitle: "Dinner Music Medley", duration: 15 },
      { id: "3e", position: 5, songTitle: "Closing Number", duration: 5 },
    ],
  },
];

const statusConfig: Record<SetlistStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-500" },
  submitted: { label: "Submitted", color: "bg-yellow-500" },
  approved: { label: "Approved", color: "bg-green-500" },
  performed: { label: "Performed", color: "bg-blue-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export default function SetlistsPage() {
  const [expandedSetlist, setExpandedSetlist] = React.useState<string | null>("1");

  const stats = {
    totalSetlists: setlists.length,
    confirmed: setlists.filter((s) => s.status === SETLIST_STATUS.APPROVED).length,
    totalSongs: setlists.reduce((acc, s) => acc + s.items.length, 0),
    totalDuration: setlists.reduce((acc, s) => acc + s.setDuration, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Setlists</h1>
          <p className="text-muted-foreground">
            Manage artist setlists and performance orders
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Setlist
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Setlists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSetlists}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSongs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.totalDuration)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search setlists..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {setlists.map((setlist) => {
          const status = statusConfig[setlist.status];
          const isExpanded = expandedSetlist === setlist.id;
          const totalItemDuration = setlist.items.reduce((acc, i) => acc + i.duration, 0);

          return (
            <Card key={setlist.id} className="hover:shadow-md transition-shadow">
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedSetlist(isExpanded ? null : setlist.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Music className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>{setlist.artistName}</CardTitle>
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{setlist.eventName}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(setlist.eventDate)}
                      </span>
                      <span>{setlist.stage}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(setlist.setDuration)} set
                      </span>
                      <span>{setlist.items.length} songs</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Setlist</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Export PDF</DropdownMenuItem>
                      <DropdownMenuItem>Share with Artist</DropdownMenuItem>
                      {setlist.status === SETLIST_STATUS.DRAFT && (
                        <DropdownMenuItem className="text-green-600">Confirm</DropdownMenuItem>
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
                          <th className="p-3 w-10"></th>
                          <th className="text-left p-3 font-medium w-12">#</th>
                          <th className="text-left p-3 font-medium">Song Title</th>
                          <th className="text-left p-3 font-medium w-24">Duration</th>
                          <th className="text-left p-3 font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {setlist.items.map((item) => (
                          <tr key={item.id} className="border-t hover:bg-muted/30">
                            <td className="p-3 text-center">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            </td>
                            <td className="p-3 font-medium">{item.position}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Music className="h-4 w-4 text-muted-foreground" />
                                {item.songTitle}
                              </div>
                            </td>
                            <td className="p-3 text-muted-foreground">{item.duration} min</td>
                            <td className="p-3 text-sm text-muted-foreground italic">
                              {item.notes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t bg-muted/30">
                          <td colSpan={3} className="p-3 font-medium text-right">Total:</td>
                          <td className="p-3 font-medium">{totalItemDuration} min</td>
                          <td className="p-3">
                            {totalItemDuration > setlist.setDuration && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Over by {totalItemDuration - setlist.setDuration} min
                              </Badge>
                            )}
                            {totalItemDuration < setlist.setDuration && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                {setlist.setDuration - totalItemDuration} min remaining
                              </Badge>
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Song
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
