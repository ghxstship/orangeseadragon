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
import {
  Plus,
  MoreHorizontal,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";

interface SSLCertificate {
  id: string;
  domain: string;
  issuer: string;
  status: "valid" | "expiring" | "expired";
  issuedAt: string;
  expiresAt: string;
  daysRemaining: number;
  autoRenew: boolean;
}

const sslCertificates: SSLCertificate[] = [
  {
    id: "1",
    domain: "*.atlvs.com",
    issuer: "Let's Encrypt",
    status: "valid",
    issuedAt: "2024-03-15",
    expiresAt: "2024-06-15",
    daysRemaining: 0,
    autoRenew: true,
  },
  {
    id: "2",
    domain: "api.atlvs.com",
    issuer: "DigiCert",
    status: "valid",
    issuedAt: "2024-01-01",
    expiresAt: "2025-01-01",
    daysRemaining: 200,
    autoRenew: true,
  },
  {
    id: "3",
    domain: "cdn.atlvs.com",
    issuer: "Cloudflare",
    status: "valid",
    issuedAt: "2024-04-01",
    expiresAt: "2024-10-01",
    daysRemaining: 108,
    autoRenew: true,
  },
  {
    id: "4",
    domain: "staging.atlvs.com",
    issuer: "Let's Encrypt",
    status: "expiring",
    issuedAt: "2024-03-20",
    expiresAt: "2024-06-20",
    daysRemaining: 5,
    autoRenew: true,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  valid: { label: "Valid", color: "bg-green-500", icon: CheckCircle },
  expiring: { label: "Expiring Soon", color: "bg-yellow-500", icon: AlertTriangle },
  expired: { label: "Expired", color: "bg-red-500", icon: AlertTriangle },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SSLCertificatesPage() {
  const validCount = sslCertificates.filter((c) => c.status === "valid").length;
  const expiringCount = sslCertificates.filter((c) => c.status === "expiring").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SSL Certificates</h1>
          <p className="text-muted-foreground">
            Manage SSL/TLS certificates for your domains
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Certificate
        </Button>
      </div>

      {expiringCount > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <div>
                <h3 className="font-medium">{expiringCount} certificate{expiringCount > 1 ? "s" : ""} expiring soon</h3>
                <p className="text-sm text-muted-foreground">
                  Renew certificates to avoid service disruption
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sslCertificates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{validCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{expiringCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Auto-Renew
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500 text-white">Enabled</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Certificates
          </CardTitle>
          <CardDescription>All SSL/TLS certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sslCertificates.map((cert) => {
              const status = statusConfig[cert.status];
              const StatusIcon = status.icon;

              return (
                <div key={cert.id} className={`p-4 border rounded-lg ${cert.status === "expiring" ? "border-yellow-500" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono font-medium">{cert.domain}</h4>
                          <Badge className={`${status.color} text-white`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                          {cert.autoRenew && (
                            <Badge variant="outline" className="text-green-500 border-green-500">
                              <RefreshCw className="mr-1 h-3 w-3" />
                              Auto-renew
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Issued by {cert.issuer}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Issued: {formatDate(cert.issuedAt)}</span>
                          <span>Expires: {formatDate(cert.expiresAt)}</span>
                          <span className={`flex items-center gap-1 ${cert.daysRemaining <= 30 ? "text-yellow-500" : ""}`}>
                            <Clock className="h-3 w-3" />
                            {cert.daysRemaining} days remaining
                          </span>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Renew Now</DropdownMenuItem>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Revoke</DropdownMenuItem>
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
