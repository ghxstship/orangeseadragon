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
  Key,
  Shield,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  Lock,
  Globe,
} from "lucide-react";

interface OAuthClient {
  id: string;
  name: string;
  clientId: string;
  type: "confidential" | "public";
  redirectUris: string[];
  scopes: string[];
  status: "active" | "inactive";
  createdAt: string;
  lastUsed?: string;
}

const oauthClients: OAuthClient[] = [
  {
    id: "1",
    name: "Mobile App",
    clientId: "atlvs_mobile_abc123",
    type: "public",
    redirectUris: ["atlvs://callback", "com.atlvs.app://oauth"],
    scopes: ["read", "write", "offline_access"],
    status: "active",
    createdAt: "2024-01-15",
    lastUsed: "2024-06-15",
  },
  {
    id: "2",
    name: "Partner Integration",
    clientId: "atlvs_partner_xyz789",
    type: "confidential",
    redirectUris: ["https://partner.example.com/callback"],
    scopes: ["read", "events", "contacts"],
    status: "active",
    createdAt: "2024-03-20",
    lastUsed: "2024-06-14",
  },
  {
    id: "3",
    name: "Internal Dashboard",
    clientId: "atlvs_internal_def456",
    type: "confidential",
    redirectUris: ["https://dashboard.atlvs.io/auth/callback"],
    scopes: ["read", "write", "admin"],
    status: "active",
    createdAt: "2024-02-10",
    lastUsed: "2024-06-15",
  },
  {
    id: "4",
    name: "Legacy Integration",
    clientId: "atlvs_legacy_old123",
    type: "confidential",
    redirectUris: ["https://old.example.com/oauth"],
    scopes: ["read"],
    status: "inactive",
    createdAt: "2023-06-01",
    lastUsed: "2024-01-15",
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  confidential: { label: "Confidential", color: "bg-blue-500" },
  public: { label: "Public", color: "bg-green-500" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-500" },
  inactive: { label: "Inactive", color: "bg-gray-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OAuthClientsPage() {
  const [showSecret, setShowSecret] = React.useState<string | null>(null);

  const activeClients = oauthClients.filter((c) => c.status === "active").length;
  const confidentialCount = oauthClients.filter((c) => c.type === "confidential").length;
  const publicCount = oauthClients.filter((c) => c.type === "public").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="OAuth Clients"
        description="Manage OAuth 2.0 client applications"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Client
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Clients"
          value={oauthClients.length}
          icon={Key}
        />
        <StatCard
          title="Active"
          value={activeClients}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Confidential"
          value={confidentialCount}
          icon={Lock}
        />
        <StatCard
          title="Public"
          value={publicCount}
          icon={Globe}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>OAuth Clients</CardTitle>
          <CardDescription>Registered OAuth 2.0 applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {oauthClients.map((client) => {
              const type = typeConfig[client.type];
              const status = statusConfig[client.status];

              return (
                <div key={client.id} className={`p-4 border rounded-lg ${client.status === "inactive" ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <Key className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{client.name}</h4>
                          <Badge className={`${type.color} text-white`}>
                            {type.label}
                          </Badge>
                          <Badge className={`${status.color} text-white`}>
                            {status.label}
                          </Badge>
                        </div>

                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Client ID:</span>
                            <code className="px-2 py-1 bg-muted rounded text-sm font-mono">{client.clientId}</code>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>

                          {client.type === "confidential" && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Client Secret:</span>
                              <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                                {showSecret === client.id ? "atlvs_secret_xxxxxxxxxxxx" : "••••••••••••••••"}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setShowSecret(showSecret === client.id ? null : client.id)}
                              >
                                {showSecret === client.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Scopes:</span>
                          {client.scopes.map((scope, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-2 text-sm text-muted-foreground">
                          <p>Redirect URIs:</p>
                          <ul className="list-disc list-inside text-xs font-mono">
                            {client.redirectUris.map((uri, idx) => (
                              <li key={idx}>{uri}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Created: {formatDate(client.createdAt)}</span>
                          {client.lastUsed && <span>Last used: {formatDate(client.lastUsed)}</span>}
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
                        <DropdownMenuItem>Edit Client</DropdownMenuItem>
                        {client.type === "confidential" && (
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Regenerate Secret
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>View Access Tokens</DropdownMenuItem>
                        {client.status === "active" ? (
                          <DropdownMenuItem className="text-yellow-600">Deactivate</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">Activate</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
