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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Plus,
  MoreHorizontal,
  Shield,
  Globe,
  Ban,
  CheckCircle,
  ListTodo,
  Activity,
} from "lucide-react";

interface IPRule {
  id: string;
  name: string;
  ipRange: string;
  type: "allow" | "deny";
  scope: "all" | "admin" | "api";
  enabled: boolean;
  createdAt: string;
  hitCount: number;
}

const ipRules: IPRule[] = [
  {
    id: "1",
    name: "Office Network",
    ipRange: "192.168.1.0/24",
    type: "allow",
    scope: "all",
    enabled: true,
    createdAt: "2024-01-15",
    hitCount: 15420,
  },
  {
    id: "2",
    name: "VPN Gateway",
    ipRange: "10.0.0.0/8",
    type: "allow",
    scope: "admin",
    enabled: true,
    createdAt: "2024-02-20",
    hitCount: 8932,
  },
  {
    id: "3",
    name: "Partner API Access",
    ipRange: "203.0.113.50",
    type: "allow",
    scope: "api",
    enabled: true,
    createdAt: "2024-03-10",
    hitCount: 45210,
  },
  {
    id: "4",
    name: "Blocked Region",
    ipRange: "198.51.100.0/24",
    type: "deny",
    scope: "all",
    enabled: true,
    createdAt: "2024-04-05",
    hitCount: 234,
  },
  {
    id: "5",
    name: "Legacy System",
    ipRange: "172.16.0.100",
    type: "allow",
    scope: "api",
    enabled: false,
    createdAt: "2023-06-01",
    hitCount: 0,
  },
];

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  allow: { label: "Allow", color: "bg-green-500", icon: CheckCircle },
  deny: { label: "Deny", color: "bg-red-500", icon: Ban },
};

const scopeConfig: Record<string, { label: string; color: string }> = {
  all: { label: "All Access", color: "bg-blue-500" },
  admin: { label: "Admin Only", color: "bg-purple-500" },
  api: { label: "API Only", color: "bg-orange-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function IPRestrictionsPage() {
  const allowRules = ipRules.filter((r) => r.type === "allow" && r.enabled).length;
  const denyRules = ipRules.filter((r) => r.type === "deny" && r.enabled).length;
  const totalHits = ipRules.reduce((acc, r) => acc + r.hitCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="IP Restrictions"
        description="Manage IP-based access controls"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Rules"
          value={ipRules.length}
          icon={ListTodo}
        />
        <StatCard
          title="Allow Rules"
          value={allowRules}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Deny Rules"
          value={denyRules}
          valueClassName="text-red-500"
          icon={Ban}
        />
        <StatCard
          title="Total Hits"
          value={formatNumber(totalHits)}
          icon={Activity}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>IP Rules</CardTitle>
            <CardDescription>Configured IP access rules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ipRules.map((rule) => {
                const type = typeConfig[rule.type];
                const scope = scopeConfig[rule.scope];
                const TypeIcon = type.icon;

                return (
                  <div key={rule.id} className={`p-4 border rounded-lg ${!rule.enabled ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${type.color}`}>
                          <TypeIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{rule.name}</h4>
                            <Badge className={`${type.color} text-white`}>
                              {type.label}
                            </Badge>
                            <Badge className={`${scope.color} text-white`}>
                              {scope.label}
                            </Badge>
                          </div>
                          <p className="text-sm font-mono mt-1">{rule.ipRange}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Created: {formatDate(rule.createdAt)}</span>
                            <span>Hits: {formatNumber(rule.hitCount)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Switch checked={rule.enabled} />

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Rule</DropdownMenuItem>
                            <DropdownMenuItem>View Logs</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Add</CardTitle>
            <CardDescription>Add a new IP rule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input placeholder="Office Network" />
            </div>
            <div className="space-y-2">
              <Label>IP Address or Range</Label>
              <Input placeholder="192.168.1.0/24" />
            </div>
            <div className="space-y-2">
              <Label>Rule Type</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="allow">Allow</option>
                <option value="deny">Deny</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Scope</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="all">All Access</option>
                <option value="admin">Admin Only</option>
                <option value="api">API Only</option>
              </select>
            </div>
            <Button className="w-full">Add Rule</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Global Settings
          </CardTitle>
          <CardDescription>Default IP restriction behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable IP Restrictions</Label>
              <p className="text-sm text-muted-foreground">Enforce IP-based access controls</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Default Action</Label>
              <p className="text-sm text-muted-foreground">Action for unmatched IPs</p>
            </div>
            <select className="p-2 border rounded-md bg-background">
              <option value="allow">Allow</option>
              <option value="deny">Deny</option>
            </select>
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Your Current IP
              </Label>
              <p className="text-sm text-muted-foreground">For reference when adding rules</p>
            </div>
            <code className="px-3 py-1 bg-muted rounded font-mono">192.168.1.xxx</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
