"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Users, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Team {
  id: string;
  name: string;
  lead: string;
  members: number;
  projects: number;
  status: string;
}

export default function PeopleTeamsPage() {
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch("/api/v1/people/teams");
        if (response.ok) {
          const result = await response.json();
          setTeams(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTeams();
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
        <div><h1 className="text-3xl font-bold tracking-tight">Teams</h1><p className="text-muted-foreground">Manage team groups</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Team</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search teams..." className="pl-9" /></div></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Teams</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{teams.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{teams.reduce((s, t) => s + t.members, 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{teams.reduce((s, t) => s + t.projects, 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Team Size</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Math.round(teams.reduce((s, t) => s + t.members, 0) / teams.length)}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />All Teams</CardTitle><CardDescription>Team groups</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {teams.map((team) => (
              <div key={team.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div><h4 className="font-medium">{team.name}</h4><p className="text-sm text-muted-foreground">Lead: {team.lead}</p></div>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>View Team</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Manage Members</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline"><Users className="h-3 w-3 mr-1" />{team.members} members</Badge>
                  <span className="text-sm text-muted-foreground">{team.projects} projects</span>
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full">View Team</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
