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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Shield,
  Lock,
  Globe,
  AlertTriangle,
  CheckCircle,
  Plus,
  Ban,
} from "lucide-react";

interface FirewallRule {
  id: string;
  name: string;
  type: "inbound" | "outbound";
  action: "allow" | "deny";
  protocol: string;
  port: string;
  source: string;
  enabled: boolean;
}

const firewallRules: FirewallRule[] = [
  {
    id: "1",
    name: "Allow HTTPS",
    type: "inbound",
    action: "allow",
    protocol: "TCP",
    port: "443",
    source: "0.0.0.0/0",
    enabled: true,
  },
  {
    id: "2",
    name: "Allow HTTP",
    type: "inbound",
    action: "allow",
    protocol: "TCP",
    port: "80",
    source: "0.0.0.0/0",
    enabled: true,
  },
  {
    id: "3",
    name: "Allow SSH",
    type: "inbound",
    action: "allow",
    protocol: "TCP",
    port: "22",
    source: "10.0.0.0/8",
    enabled: true,
  },
  {
    id: "4",
    name: "Block Suspicious IPs",
    type: "inbound",
    action: "deny",
    protocol: "All",
    port: "All",
    source: "Threat Intelligence",
    enabled: true,
  },
  {
    id: "5",
    name: "Allow Database",
    type: "inbound",
    action: "allow",
    protocol: "TCP",
    port: "5432",
    source: "10.0.0.0/8",
    enabled: true,
  },
];

const securityMetrics = {
  blockedRequests: 12500,
  threatsDetected: 23,
  ddosAttempts: 3,
  suspiciousIPs: 156,
};

export default function NetworkSecurityPage() {
  const enabledRules = firewallRules.filter((r) => r.enabled).length;
  const denyRules = firewallRules.filter((r) => r.action === "deny").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network Security"
        description="Firewall rules and network protection"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Blocked Requests (24h)"
          value={securityMetrics.blockedRequests.toLocaleString()}
          icon={Ban}
        />
        <StatCard
          title="Threats Detected"
          value={securityMetrics.threatsDetected}
          valueClassName="text-red-500"
          icon={AlertTriangle}
        />
        <StatCard
          title="DDoS Attempts"
          value={securityMetrics.ddosAttempts}
          valueClassName="text-yellow-500"
          icon={Shield}
        />
        <StatCard
          title="Suspicious IPs"
          value={securityMetrics.suspiciousIPs}
          icon={Globe}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Firewall Rules
          </CardTitle>
          <CardDescription>
            {enabledRules} rules enabled • {denyRules} deny rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {firewallRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Switch checked={rule.enabled} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge className={rule.action === "allow" ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                        {rule.action === "allow" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <AlertTriangle className="mr-1 h-3 w-3" />
                        )}
                        {rule.action.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{rule.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {rule.protocol} : {rule.port} ← {rule.source}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>DDoS Protection</Label>
                <p className="text-sm text-muted-foreground">Automatic DDoS mitigation</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>WAF (Web Application Firewall)</Label>
                <p className="text-sm text-muted-foreground">Protect against web attacks</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Bot Protection</Label>
                <p className="text-sm text-muted-foreground">Block malicious bots</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Rate Limiting</Label>
                <p className="text-sm text-muted-foreground">Limit requests per IP</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geo Blocking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Block traffic from specific countries</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">No countries blocked</Badge>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Configure Geo Blocking
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
