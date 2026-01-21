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
  Folder,
  Users,
  Calendar,
  Star,
  Lock,
  Globe,
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  description: string;
  type: "project" | "department" | "client" | "event";
  visibility: "public" | "private" | "restricted";
  memberCount: number;
  projectCount: number;
  createdDate: string;
  lastActivity: string;
  isFavorite: boolean;
  color: string;
}

const workspaces: Workspace[] = [
  {
    id: "1",
    name: "Summer Festival 2024",
    description: "Main workspace for Summer Festival planning and execution",
    type: "event",
    visibility: "private",
    memberCount: 24,
    projectCount: 8,
    createdDate: "2023-10-15",
    lastActivity: "2024-01-15",
    isFavorite: true,
    color: "bg-blue-500",
  },
  {
    id: "2",
    name: "Corporate Events",
    description: "All corporate event projects and resources",
    type: "department",
    visibility: "restricted",
    memberCount: 12,
    projectCount: 5,
    createdDate: "2023-06-01",
    lastActivity: "2024-01-14",
    isFavorite: true,
    color: "bg-purple-500",
  },
  {
    id: "3",
    name: "TechCorp Partnership",
    description: "Client workspace for TechCorp projects",
    type: "client",
    visibility: "private",
    memberCount: 8,
    projectCount: 3,
    createdDate: "2023-09-20",
    lastActivity: "2024-01-13",
    isFavorite: false,
    color: "bg-green-500",
  },
  {
    id: "4",
    name: "Marketing Team",
    description: "Marketing department workspace",
    type: "department",
    visibility: "public",
    memberCount: 6,
    projectCount: 4,
    createdDate: "2023-04-10",
    lastActivity: "2024-01-12",
    isFavorite: false,
    color: "bg-pink-500",
  },
  {
    id: "5",
    name: "New Year Concert 2024",
    description: "Planning for NYE concert event",
    type: "event",
    visibility: "private",
    memberCount: 18,
    projectCount: 6,
    createdDate: "2023-08-01",
    lastActivity: "2024-01-10",
    isFavorite: true,
    color: "bg-orange-500",
  },
  {
    id: "6",
    name: "Vendor Management",
    description: "Shared workspace for vendor coordination",
    type: "project",
    visibility: "restricted",
    memberCount: 10,
    projectCount: 2,
    createdDate: "2023-11-15",
    lastActivity: "2024-01-08",
    isFavorite: false,
    color: "bg-teal-500",
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  project: { label: "Project", color: "bg-blue-500" },
  department: { label: "Department", color: "bg-purple-500" },
  client: { label: "Client", color: "bg-green-500" },
  event: { label: "Event", color: "bg-orange-500" },
};

const visibilityConfig: Record<string, { icon: React.ElementType; label: string }> = {
  public: { icon: Globe, label: "Public" },
  private: { icon: Lock, label: "Private" },
  restricted: { icon: Users, label: "Restricted" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function WorkspacesPage() {
  const favoriteWorkspaces = workspaces.filter((w) => w.isFavorite);
  const otherWorkspaces = workspaces.filter((w) => !w.isFavorite);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground">
            Organize projects and collaborate with teams
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Workspace
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Workspaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workspaces.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workspaces.reduce((acc, w) => acc + w.projectCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{favoriteWorkspaces.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search workspaces..." className="pl-9" />
        </div>
      </div>

      {favoriteWorkspaces.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            Favorites
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favoriteWorkspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">All Workspaces</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {otherWorkspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  const type = typeConfig[workspace.type];
  const visibility = visibilityConfig[workspace.visibility];
  const VisibilityIcon = visibility.icon;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${workspace.color}`}>
              <Folder className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {workspace.name}
                {workspace.isFavorite && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${type.color} text-white text-xs`}>
                  {type.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <VisibilityIcon className="mr-1 h-3 w-3" />
                  {visibility.label}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Open Workspace</DropdownMenuItem>
              <DropdownMenuItem>Edit Settings</DropdownMenuItem>
              <DropdownMenuItem>Manage Members</DropdownMenuItem>
              <DropdownMenuItem>
                {workspace.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="mt-2">{workspace.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {workspace.memberCount}
            </span>
            <span className="flex items-center gap-1">
              <Folder className="h-4 w-4" />
              {workspace.projectCount} projects
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(workspace.lastActivity)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
