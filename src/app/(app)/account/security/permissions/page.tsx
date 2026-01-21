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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  CheckCircle,
  XCircle,
  Shield,
  Users,
  Layers,
  Key,
  Calendar,
} from "lucide-react";

interface PermissionModule {
  name: string;
  permissions: string[];
}

interface RolePermissions {
  role: string;
  permissions: Record<string, boolean>;
}

const modules: PermissionModule[] = [
  { name: "Events", permissions: ["View", "Create", "Edit", "Delete"] },
  { name: "Contacts", permissions: ["View", "Create", "Edit", "Delete"] },
  { name: "Invoices", permissions: ["View", "Create", "Edit", "Delete"] },
  { name: "Vendors", permissions: ["View", "Create", "Edit", "Delete"] },
  { name: "Reports", permissions: ["View", "Create", "Export"] },
  { name: "Settings", permissions: ["View", "Edit"] },
];

const rolePermissions: RolePermissions[] = [
  {
    role: "Administrator",
    permissions: {
      "Events-View": true, "Events-Create": true, "Events-Edit": true, "Events-Delete": true,
      "Contacts-View": true, "Contacts-Create": true, "Contacts-Edit": true, "Contacts-Delete": true,
      "Invoices-View": true, "Invoices-Create": true, "Invoices-Edit": true, "Invoices-Delete": true,
      "Vendors-View": true, "Vendors-Create": true, "Vendors-Edit": true, "Vendors-Delete": true,
      "Reports-View": true, "Reports-Create": true, "Reports-Export": true,
      "Settings-View": true, "Settings-Edit": true,
    },
  },
  {
    role: "Event Manager",
    permissions: {
      "Events-View": true, "Events-Create": true, "Events-Edit": true, "Events-Delete": false,
      "Contacts-View": true, "Contacts-Create": true, "Contacts-Edit": true, "Contacts-Delete": false,
      "Invoices-View": true, "Invoices-Create": true, "Invoices-Edit": false, "Invoices-Delete": false,
      "Vendors-View": true, "Vendors-Create": false, "Vendors-Edit": false, "Vendors-Delete": false,
      "Reports-View": true, "Reports-Create": true, "Reports-Export": true,
      "Settings-View": true, "Settings-Edit": false,
    },
  },
  {
    role: "Finance",
    permissions: {
      "Events-View": true, "Events-Create": false, "Events-Edit": false, "Events-Delete": false,
      "Contacts-View": true, "Contacts-Create": false, "Contacts-Edit": false, "Contacts-Delete": false,
      "Invoices-View": true, "Invoices-Create": true, "Invoices-Edit": true, "Invoices-Delete": true,
      "Vendors-View": true, "Vendors-Create": true, "Vendors-Edit": true, "Vendors-Delete": false,
      "Reports-View": true, "Reports-Create": true, "Reports-Export": true,
      "Settings-View": false, "Settings-Edit": false,
    },
  },
  {
    role: "Viewer",
    permissions: {
      "Events-View": true, "Events-Create": false, "Events-Edit": false, "Events-Delete": false,
      "Contacts-View": true, "Contacts-Create": false, "Contacts-Edit": false, "Contacts-Delete": false,
      "Invoices-View": true, "Invoices-Create": false, "Invoices-Edit": false, "Invoices-Delete": false,
      "Vendors-View": true, "Vendors-Create": false, "Vendors-Edit": false, "Vendors-Delete": false,
      "Reports-View": true, "Reports-Create": false, "Reports-Export": false,
      "Settings-View": false, "Settings-Edit": false,
    },
  },
];

export default function PermissionMatrixPage() {
  const totalPermissions = modules.reduce((acc, m) => acc + m.permissions.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permission Matrix"
        description="View and manage role permissions across modules"
        actions={
          <Button>
            <Shield className="mr-2 h-4 w-4" />
            Edit Permissions
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Roles"
          value={rolePermissions.length}
          icon={Users}
        />
        <StatCard
          title="Modules"
          value={modules.length}
          icon={Layers}
        />
        <StatCard
          title="Total Permissions"
          value={totalPermissions}
          icon={Key}
        />
        <StatCard
          title="Last Updated"
          value="June 15, 2024"
          icon={Calendar}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>Role-based access control overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Module / Permission</th>
                  {rolePermissions.map((rp) => (
                    <th key={rp.role} className="text-center p-3 font-medium">
                      <Badge variant="outline">{rp.role}</Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => (
                  <React.Fragment key={mod.name}>
                    <tr className="bg-muted/50">
                      <td colSpan={rolePermissions.length + 1} className="p-3 font-medium">
                        {mod.name}
                      </td>
                    </tr>
                    {mod.permissions.map((perm) => (
                      <tr key={`${mod.name}-${perm}`} className="border-b">
                        <td className="p-3 pl-6 text-sm text-muted-foreground">{perm}</td>
                        {rolePermissions.map((rp) => {
                          const hasPermission = rp.permissions[`${mod.name}-${perm}`];
                          return (
                            <td key={`${rp.role}-${mod.name}-${perm}`} className="text-center p-3">
                              {hasPermission ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Permission Granted</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm">Permission Denied</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
