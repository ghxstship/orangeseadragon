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
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Shield,
  Users,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isSystem: boolean;
  permissions: Record<string, boolean>;
}

const permissionCategories = [
  {
    name: "Projects",
    permissions: [
      { id: "projects.view", name: "View Projects", description: "View project details" },
      { id: "projects.create", name: "Create Projects", description: "Create new projects" },
      { id: "projects.edit", name: "Edit Projects", description: "Modify project settings" },
      { id: "projects.delete", name: "Delete Projects", description: "Remove projects" },
    ],
  },
  {
    name: "Events",
    permissions: [
      { id: "events.view", name: "View Events", description: "View event details" },
      { id: "events.create", name: "Create Events", description: "Create new events" },
      { id: "events.edit", name: "Edit Events", description: "Modify event settings" },
      { id: "events.delete", name: "Delete Events", description: "Remove events" },
    ],
  },
  {
    name: "Team",
    permissions: [
      { id: "team.view", name: "View Team", description: "View team members" },
      { id: "team.invite", name: "Invite Members", description: "Invite new team members" },
      { id: "team.manage", name: "Manage Members", description: "Edit member details" },
      { id: "team.remove", name: "Remove Members", description: "Remove team members" },
    ],
  },
  {
    name: "Finance",
    permissions: [
      { id: "finance.view", name: "View Finance", description: "View financial data" },
      { id: "finance.create", name: "Create Invoices", description: "Create invoices" },
      { id: "finance.approve", name: "Approve Expenses", description: "Approve expense reports" },
      { id: "finance.reports", name: "Financial Reports", description: "Access financial reports" },
    ],
  },
];

const roles: Role[] = [
  {
    id: "1",
    name: "Admin",
    description: "Full access to all features and settings",
    memberCount: 2,
    isSystem: true,
    permissions: {
      "projects.view": true, "projects.create": true, "projects.edit": true, "projects.delete": true,
      "events.view": true, "events.create": true, "events.edit": true, "events.delete": true,
      "team.view": true, "team.invite": true, "team.manage": true, "team.remove": true,
      "finance.view": true, "finance.create": true, "finance.approve": true, "finance.reports": true,
    },
  },
  {
    id: "2",
    name: "Project Manager",
    description: "Manage projects and team assignments",
    memberCount: 5,
    isSystem: true,
    permissions: {
      "projects.view": true, "projects.create": true, "projects.edit": true, "projects.delete": false,
      "events.view": true, "events.create": true, "events.edit": true, "events.delete": false,
      "team.view": true, "team.invite": false, "team.manage": false, "team.remove": false,
      "finance.view": true, "finance.create": false, "finance.approve": false, "finance.reports": true,
    },
  },
  {
    id: "3",
    name: "Event Coordinator",
    description: "Manage events and schedules",
    memberCount: 8,
    isSystem: false,
    permissions: {
      "projects.view": true, "projects.create": false, "projects.edit": false, "projects.delete": false,
      "events.view": true, "events.create": true, "events.edit": true, "events.delete": false,
      "team.view": true, "team.invite": false, "team.manage": false, "team.remove": false,
      "finance.view": false, "finance.create": false, "finance.approve": false, "finance.reports": false,
    },
  },
  {
    id: "4",
    name: "Crew Member",
    description: "Basic access for crew and staff",
    memberCount: 15,
    isSystem: true,
    permissions: {
      "projects.view": true, "projects.create": false, "projects.edit": false, "projects.delete": false,
      "events.view": true, "events.create": false, "events.edit": false, "events.delete": false,
      "team.view": true, "team.invite": false, "team.manage": false, "team.remove": false,
      "finance.view": false, "finance.create": false, "finance.approve": false, "finance.reports": false,
    },
  },
];

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = React.useState<string>("1");
  const currentRole = roles.find((r) => r.id === selectedRole);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles &amp; Permissions</h1>
          <p className="text-muted-foreground">
            Manage access control for your organization
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Roles</h2>
          {roles.map((role) => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all ${
                selectedRole === role.id ? "ring-2 ring-primary" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{role.name}</CardTitle>
                    {role.isSystem && (
                      <Badge variant="outline" className="text-xs">System</Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Role</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      {!role.isSystem && (
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{role.memberCount} members</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          {currentRole && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {currentRole.name} Permissions
                    </CardTitle>
                    <CardDescription>{currentRole.description}</CardDescription>
                  </div>
                  {currentRole.isSystem && (
                    <Badge variant="outline">System Role - Limited Editing</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {permissionCategories.map((category) => (
                    <div key={category.name}>
                      <h3 className="font-semibold mb-3">{category.name}</h3>
                      <div className="space-y-3">
                        {category.permissions.map((permission) => {
                          const isEnabled = currentRole.permissions[permission.id] || false;
                          return (
                            <div
                              key={permission.id}
                              className="flex items-center justify-between p-3 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                {isEnabled ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-muted-foreground" />
                                )}
                                <div>
                                  <p className="font-medium text-sm">{permission.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                              <Switch
                                checked={isEnabled}
                                disabled={currentRole.isSystem && currentRole.name === "Admin"}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
                  <Button variant="outline">Reset to Default</Button>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
