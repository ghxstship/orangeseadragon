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
  Key,
  Lock,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface Secret {
  id: string;
  name: string;
  type: "api_key" | "password" | "certificate" | "token" | "connection_string";
  environment: "all" | "production" | "staging" | "development";
  lastRotated: string;
  expiresAt?: string;
  accessCount: number;
}

const secrets: Secret[] = [
  {
    id: "1",
    name: "DATABASE_PASSWORD",
    type: "password",
    environment: "all",
    lastRotated: "2024-06-01",
    accessCount: 1250,
  },
  {
    id: "2",
    name: "STRIPE_SECRET_KEY",
    type: "api_key",
    environment: "production",
    lastRotated: "2024-05-15",
    accessCount: 890,
  },
  {
    id: "3",
    name: "JWT_SIGNING_KEY",
    type: "token",
    environment: "all",
    lastRotated: "2024-04-01",
    expiresAt: "2024-10-01",
    accessCount: 45000,
  },
  {
    id: "4",
    name: "AWS_SECRET_ACCESS_KEY",
    type: "api_key",
    environment: "all",
    lastRotated: "2024-06-10",
    accessCount: 3200,
  },
  {
    id: "5",
    name: "REDIS_PASSWORD",
    type: "password",
    environment: "all",
    lastRotated: "2024-05-20",
    accessCount: 2100,
  },
  {
    id: "6",
    name: "SSL_PRIVATE_KEY",
    type: "certificate",
    environment: "production",
    lastRotated: "2024-03-15",
    expiresAt: "2025-03-15",
    accessCount: 150,
  },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  api_key: { icon: Key, color: "bg-blue-500" },
  password: { icon: Lock, color: "bg-red-500" },
  certificate: { icon: Lock, color: "bg-green-500" },
  token: { icon: Key, color: "bg-purple-500" },
  connection_string: { icon: Lock, color: "bg-orange-500" },
};

const envConfig: Record<string, { color: string }> = {
  all: { color: "bg-purple-500" },
  production: { color: "bg-red-500" },
  staging: { color: "bg-yellow-500" },
  development: { color: "bg-blue-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SecretsManagementPage() {
  const [visibleSecrets, setVisibleSecrets] = React.useState<Record<string, boolean>>({});

  const toggleVisibility = (id: string) => {
    setVisibleSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const prodSecrets = secrets.filter((s) => s.environment === "production" || s.environment === "all").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Secrets Management</h1>
          <p className="text-muted-foreground">
            Securely manage application secrets and credentials
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Secret
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Secrets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{secrets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prodSecrets}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {secrets.filter((s) => s.expiresAt).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Rotation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Jun 10, 2024</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search secrets..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Secrets
          </CardTitle>
          <CardDescription>All managed secrets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {secrets.map((secret) => {
              const type = typeConfig[secret.type];
              const env = envConfig[secret.environment];
              const TypeIcon = type.icon;
              const isVisible = visibleSecrets[secret.id];

              return (
                <div key={secret.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <TypeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{secret.name}</span>
                        <Badge className={`${env.color} text-white`}>
                          {secret.environment}
                        </Badge>
                        <Badge variant="outline">{secret.type.replace("_", " ")}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Rotated: {formatDate(secret.lastRotated)}</span>
                        {secret.expiresAt && (
                          <span className="text-yellow-500">Expires: {formatDate(secret.expiresAt)}</span>
                        )}
                        <span>{secret.accessCount.toLocaleString()} accesses</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibility(secret.id)}
                    >
                      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Value</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Rotate</DropdownMenuItem>
                        <DropdownMenuItem>View Access Log</DropdownMenuItem>
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
