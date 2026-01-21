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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  UserPlus,
  MoreHorizontal,
  Mail,
  Phone,
  Shield,
  Calendar,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "pending";
  joinedDate: string;
  permissions: string[];
}

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@company.com",
    phone: "+1 555-0101",
    role: "Admin",
    department: "Operations",
    status: "active",
    joinedDate: "2023-01-15",
    permissions: ["admin", "billing", "team"],
  },
  {
    id: "2",
    name: "Mike Johnson",
    email: "mike@company.com",
    phone: "+1 555-0102",
    role: "Project Manager",
    department: "Production",
    status: "active",
    joinedDate: "2023-03-20",
    permissions: ["projects", "team"],
  },
  {
    id: "3",
    name: "Emily Watson",
    email: "emily@company.com",
    role: "Event Coordinator",
    department: "Events",
    status: "active",
    joinedDate: "2023-06-10",
    permissions: ["events", "calendar"],
  },
  {
    id: "4",
    name: "Tom Wilson",
    email: "tom@company.com",
    phone: "+1 555-0104",
    role: "Technical Lead",
    department: "Production",
    status: "active",
    joinedDate: "2023-02-28",
    permissions: ["assets", "inventory"],
  },
  {
    id: "5",
    name: "Lisa Park",
    email: "lisa@company.com",
    role: "Marketing Manager",
    department: "Marketing",
    status: "active",
    joinedDate: "2023-08-15",
    permissions: ["marketing", "reports"],
  },
  {
    id: "6",
    name: "David Kim",
    email: "david@company.com",
    role: "Sales Representative",
    department: "Sales",
    status: "active",
    joinedDate: "2023-09-01",
    permissions: ["crm", "contacts"],
  },
  {
    id: "7",
    name: "Jennifer Lee",
    email: "jennifer@company.com",
    role: "Finance Manager",
    department: "Finance",
    status: "active",
    joinedDate: "2023-04-12",
    permissions: ["finance", "billing", "reports"],
  },
  {
    id: "8",
    name: "Alex Thompson",
    email: "alex@company.com",
    role: "Crew Member",
    department: "Production",
    status: "pending",
    joinedDate: "2024-01-10",
    permissions: ["tasks"],
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-500" },
  inactive: { label: "Inactive", color: "bg-gray-500" },
  pending: { label: "Pending", color: "bg-yellow-500" },
};

const roleColors: Record<string, string> = {
  Admin: "bg-red-500",
  "Project Manager": "bg-blue-500",
  "Event Coordinator": "bg-purple-500",
  "Technical Lead": "bg-orange-500",
  "Marketing Manager": "bg-pink-500",
  "Sales Representative": "bg-teal-500",
  "Finance Manager": "bg-emerald-500",
  "Crew Member": "bg-gray-500",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function TeamPage() {
  const stats = {
    totalMembers: teamMembers.length,
    activeMembers: teamMembers.filter((m) => m.status === "active").length,
    pendingInvites: teamMembers.filter((m) => m.status === "pending").length,
    departments: new Set(teamMembers.map((m) => m.department)).size,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s team members
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.activeMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingInvites}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search team members..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => {
          const status = statusConfig[member.status];
          const roleColor = roleColors[member.role] || "bg-gray-500";

          return (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{member.name}</CardTitle>
                      <CardDescription>{member.department}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit Member</DropdownMenuItem>
                      <DropdownMenuItem>Manage Permissions</DropdownMenuItem>
                      {member.status === "pending" && (
                        <DropdownMenuItem>Resend Invite</DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive">
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${roleColor} text-white`}>
                      {member.role}
                    </Badge>
                    <Badge className={`${status.color} text-white`}>
                      {status.label}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(member.joinedDate)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {member.permissions.slice(0, 3).map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                        {member.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.permissions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
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
