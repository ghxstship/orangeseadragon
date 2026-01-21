"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, Calendar, Clock, MapPin, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CrewCall {
  id: string;
  event: string;
  date: string;
  call_time: string;
  location: string;
  crew_needed: number;
  crew_confirmed: number;
  status: string;
}

export default function PeopleCrewCallsPage() {
  const [crewCalls, setCrewCalls] = React.useState<CrewCall[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCrewCalls() {
      try {
        const response = await fetch("/api/v1/people/crew-calls");
        if (response.ok) {
          const result = await response.json();
          setCrewCalls(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch crew calls:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCrewCalls();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Crew Calls</h1><p className="text-muted-foreground">Manage crew scheduling for events</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />New Crew Call</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search crew calls..." className="pl-9" /></div></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Calls</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{crewCalls.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Crew Needed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{crewCalls.reduce((s, c) => s + c.crew_needed, 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{crewCalls.reduce((s, c) => s + c.crew_confirmed, 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Open Positions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-500">{crewCalls.reduce((s, c) => s + (c.crew_needed - c.crew_confirmed), 0)}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Crew Calls</CardTitle><CardDescription>Upcoming crew scheduling</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {crewCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{call.event}</h4><Badge variant={call.status === "filled" ? "default" : "secondary"}>{call.status}</Badge></div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{call.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{call.call_time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{call.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><p className="font-medium">{call.crew_confirmed}/{call.crew_needed}</p><p className="text-xs text-muted-foreground">Confirmed</p></div>
                  <Button variant="outline" size="sm">Manage</Button>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem>Send Invites</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
