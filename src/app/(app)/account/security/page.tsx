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
import {
  Shield,
  Key,
  Smartphone,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Monitor,
} from "lucide-react";

interface SecuritySession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

const sessions: SecuritySession[] = [
  {
    id: "1",
    device: "MacBook Pro",
    browser: "Chrome 125",
    location: "Los Angeles, CA",
    ipAddress: "192.168.1.xxx",
    lastActive: "2024-06-15T15:30:00",
    isCurrent: true,
  },
  {
    id: "2",
    device: "iPhone 15 Pro",
    browser: "Safari Mobile",
    location: "Los Angeles, CA",
    ipAddress: "192.168.1.xxx",
    lastActive: "2024-06-15T14:00:00",
    isCurrent: false,
  },
  {
    id: "3",
    device: "Windows PC",
    browser: "Firefox 126",
    location: "New York, NY",
    ipAddress: "10.0.0.xxx",
    lastActive: "2024-06-14T09:30:00",
    isCurrent: false,
  },
];

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security</h1>
        <p className="text-muted-foreground">
          Manage your account security settings
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              85/100
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              2FA Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-500 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Enabled
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Password Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">45 days ago</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password
            </CardTitle>
            <CardDescription>Manage your password settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Password</p>
                <p className="text-sm text-muted-foreground">Last changed 45 days ago</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Password Expiry</Label>
                <p className="text-sm text-muted-foreground">Require password change every 90 days</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>Add an extra layer of security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Authenticator App</p>
                  <p className="text-sm text-muted-foreground">Google Authenticator configured</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">SMS Backup</p>
                  <p className="text-sm text-muted-foreground">Not configured</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Setup</Button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Recovery Codes</p>
                  <p className="text-sm text-muted-foreground">8 codes remaining</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View Codes</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Preferences
            </CardTitle>
            <CardDescription>Configure security options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Login Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified of new logins</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Suspicious Activity Alerts</Label>
                <p className="text-sm text-muted-foreground">Alert on unusual account activity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
              </div>
              <select className="p-2 border rounded-md bg-background">
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="240">4 hours</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Login Restrictions
            </CardTitle>
            <CardDescription>Control where you can login from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>IP Allowlist</Label>
                <p className="text-sm text-muted-foreground">Restrict logins to specific IPs</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Country Restrictions</Label>
                <p className="text-sm text-muted-foreground">Block logins from certain countries</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>VPN/Proxy Detection</Label>
                <p className="text-sm text-muted-foreground">Block logins from VPNs</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Devices currently logged into your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{session.device}</h4>
                      {session.isCurrent && (
                        <Badge className="bg-green-500 text-white">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{session.browser}</span>
                      <span>{session.location}</span>
                      <span>{session.ipAddress}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active: {formatDateTime(session.lastActive)}
                    </p>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button variant="outline" size="sm" className="text-red-500">
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="text-red-500">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Sign Out All Other Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
