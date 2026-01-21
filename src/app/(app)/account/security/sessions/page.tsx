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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  MapPin,
  LogOut,
  Shield,
} from "lucide-react";

interface Session {
  id: string;
  device: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

const sessions: Session[] = [
  {
    id: "1",
    device: "MacBook Pro",
    deviceType: "desktop",
    browser: "Chrome 125",
    location: "Los Angeles, CA",
    ipAddress: "192.168.1.xxx",
    lastActive: "2024-06-15T15:30:00",
    isCurrent: true,
  },
  {
    id: "2",
    device: "iPhone 15 Pro",
    deviceType: "mobile",
    browser: "Safari Mobile",
    location: "Los Angeles, CA",
    ipAddress: "10.0.0.xxx",
    lastActive: "2024-06-15T14:00:00",
    isCurrent: false,
  },
  {
    id: "3",
    device: "Windows PC",
    deviceType: "desktop",
    browser: "Firefox 126",
    location: "New York, NY",
    ipAddress: "203.0.113.xxx",
    lastActive: "2024-06-14T18:30:00",
    isCurrent: false,
  },
  {
    id: "4",
    device: "iPad Pro",
    deviceType: "tablet",
    browser: "Safari",
    location: "Los Angeles, CA",
    ipAddress: "192.168.1.xxx",
    lastActive: "2024-06-13T10:00:00",
    isCurrent: false,
  },
];

const deviceIcons: Record<string, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 5) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

export default function SessionManagementPage() {
  const activeSessions = sessions.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session Management</h1>
          <p className="text-muted-foreground">
            Manage active sessions and security settings
          </p>
        </div>
        <Button variant="destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out All Devices
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Desktop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.filter((s) => s.deviceType === "desktop").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mobile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.filter((s) => s.deviceType === "mobile").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tablet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.filter((s) => s.deviceType === "tablet").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => {
              const DeviceIcon = deviceIcons[session.deviceType];

              return (
                <div key={session.id} className={`p-4 border rounded-lg ${session.isCurrent ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        <DeviceIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{session.device}</h4>
                          {session.isCurrent && (
                            <Badge className="bg-green-500 text-white">Current Session</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {session.browser}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {session.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {session.ipAddress}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {getTimeAgo(session.lastActive)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <Button variant="outline" size="sm" className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Settings
          </CardTitle>
          <CardDescription>Configure session security options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Session Timeout</Label>
              <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
            </div>
            <select className="p-2 border rounded-md bg-background">
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
              <option value="1440">24 hours</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Remember Device</Label>
              <p className="text-sm text-muted-foreground">Stay signed in on trusted devices</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Concurrent Sessions</Label>
              <p className="text-sm text-muted-foreground">Maximum active sessions allowed</p>
            </div>
            <select className="p-2 border rounded-md bg-background">
              <option value="1">1 session</option>
              <option value="3">3 sessions</option>
              <option value="5">5 sessions</option>
              <option value="10">10 sessions</option>
              <option value="0">Unlimited</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Login Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified of new sign-ins</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
