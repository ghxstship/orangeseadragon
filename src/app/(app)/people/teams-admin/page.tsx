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
  Plus,
  MoreHorizontal,
  Users,
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  description: string;
  lead: string;
  memberCount: number;
  department: string;
  status: "active" | "inactive";
  projects: number;
}

const teams: Team[] = [
  {
    id: "1",
    name: "Event Planning A",
    description: "Primary event planning team",
    lead: "Emily Watson",
    memberCount: 5,
    department: "Events",
    status: "active",
    projects: 8,
  },
  {
    id: "2",
    name: "Event Planning B",
    description: "Secondary event planning team",
    lead: "Tom Harris",
    memberCount: 4,
    department: "Events",
    status: "active",
    projects: 6,
  },
  {
    id: "3",
    name: "Vendor Relations",
    description: "Vendor management and partnerships",
    lead: "Lisa Chen",
    memberCount: 3,
    department: "Operations",
    status: "active",
    projects: 4,
  },
  {
    id: "4",
    name: "Finance Team",
    description: "Financial operations and reporting",
    lead: "David Park",
    memberCount: 4,
    department: "Finance",
    status: "active",
    projects: 3,
  },
  {
    id: "5",
    name: "Marketing Team",
    description: "Marketing campaigns and communications",
    lead: "Alex Kim",
    memberCount: 5,
    department: "Marketing",
    status: "active",
    projects: 7,
  },
  {
    id: "6",
    name: "Tech Support",
    description: "Technical support and systems",
    lead: "James Lee",
    memberCount: 3,
    department: "IT",
    status: "active",
    projects: 2,
  },
];

export default function TeamsManagementPage() {
  const totalMembers = teams.reduce((acc, t) => acc + t.memberCount, 0);
  const totalProjects = teams.reduce((acc, t) => acc + t.projects, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            Manage teams and team assignments
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(totalMembers / teams.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search teams..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Teams</CardTitle>
          <CardDescription>Team roster and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div key={team.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{team.name}</h4>
                      <Badge variant="outline" className="mt-1">
                        {team.department}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Members</DropdownMenuItem>
                      <DropdownMenuItem>View Projects</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{team.description}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Lead</p>
                    <p className="font-medium">{team.lead}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {team.memberCount} members
                    </p>
                    <p className="text-muted-foreground">{team.projects} projects</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
