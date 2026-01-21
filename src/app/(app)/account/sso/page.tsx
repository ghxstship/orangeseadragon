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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Key,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface SSOProvider {
  id: string;
  name: string;
  type: "saml" | "oidc" | "oauth2";
  status: "active" | "inactive" | "error";
  domain?: string;
  lastLogin?: string;
  userCount: number;
}

const ssoProviders: SSOProvider[] = [
  {
    id: "1",
    name: "Okta",
    type: "saml",
    status: "active",
    domain: "atlvs.okta.com",
    lastLogin: "2024-06-15T14:30:00",
    userCount: 45,
  },
  {
    id: "2",
    name: "Azure AD",
    type: "oidc",
    status: "inactive",
    domain: "login.microsoftonline.com",
    userCount: 0,
  },
  {
    id: "3",
    name: "Google Workspace",
    type: "oauth2",
    status: "active",
    domain: "atlvs.com",
    lastLogin: "2024-06-15T12:00:00",
    userCount: 12,
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  saml: { label: "SAML 2.0", color: "bg-blue-500" },
  oidc: { label: "OpenID Connect", color: "bg-purple-500" },
  oauth2: { label: "OAuth 2.0", color: "bg-green-500" },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: "Active", color: "bg-green-500", icon: CheckCircle },
  inactive: { label: "Inactive", color: "bg-gray-500", icon: AlertTriangle },
  error: { label: "Error", color: "bg-red-500", icon: AlertTriangle },
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SSOSettingsPage() {
  const activeProviders = ssoProviders.filter((p) => p.status === "active").length;
  const totalUsers = ssoProviders.reduce((acc, p) => acc + p.userCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SSO Settings</h1>
          <p className="text-muted-foreground">
            Configure Single Sign-On providers
          </p>
        </div>
        <Button>
          <Key className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SSO Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ssoProviders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{activeProviders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SSO Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enforcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-500">Optional</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SSO Providers</CardTitle>
            <CardDescription>Configured identity providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ssoProviders.map((provider) => {
                const type = typeConfig[provider.type];
                const status = statusConfig[provider.status];
                const StatusIcon = status.icon;

                return (
                  <div key={provider.id} className={`p-4 border rounded-lg ${provider.status === "inactive" ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-muted">
                          <Shield className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{provider.name}</h4>
                            <Badge className={`${type.color} text-white`}>
                              {type.label}
                            </Badge>
                            <Badge className={`${status.color} text-white`}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                          {provider.domain && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Domain: {provider.domain}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{provider.userCount} users</span>
                            {provider.lastLogin && (
                              <span>Last login: {formatDateTime(provider.lastLogin)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={provider.status === "active"} />
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
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
            <CardTitle>SSO Configuration</CardTitle>
            <CardDescription>Global SSO settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enforce SSO</Label>
                <p className="text-sm text-muted-foreground">Require SSO for all users</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Auto-provision Users</Label>
                <p className="text-sm text-muted-foreground">Create accounts on first login</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Allow Password Login</Label>
                <p className="text-sm text-muted-foreground">Allow non-SSO authentication</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="pt-4 border-t space-y-2">
              <Label>Default Role for SSO Users</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Label>Allowed Email Domains</Label>
              <Input placeholder="atlvs.com, example.com" defaultValue="atlvs.com" />
              <p className="text-xs text-muted-foreground">Comma-separated list of allowed domains</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
