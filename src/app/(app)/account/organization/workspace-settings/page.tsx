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
  Settings,
  Building,
  Globe,
  Shield,
  Bell,
} from "lucide-react";

export default function WorkspaceSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
          <p className="text-muted-foreground">
            Configure your workspace preferences
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Workspace
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Acme Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-primary text-primary-foreground">Professional</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-500 text-white">Active</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic workspace information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Workspace Name</Label>
              <Input defaultValue="Acme Events" />
            </div>
            <div className="space-y-2">
              <Label>Workspace URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">atlvs.com/</span>
                <Input defaultValue="acme-events" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="events">Event Management</option>
                <option value="hospitality">Hospitality</option>
                <option value="entertainment">Entertainment</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regional Settings
            </CardTitle>
            <CardDescription>Timezone and locale preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Workspace Preferences
          </CardTitle>
          <CardDescription>Configure workspace-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Member Invitations</Label>
              <p className="text-sm text-muted-foreground">Let members invite others to the workspace</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Require Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Enforce 2FA for all workspace members</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Activity Logging</Label>
              <p className="text-sm text-muted-foreground">Track all user activity in the workspace</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Public Profile</Label>
              <p className="text-sm text-muted-foreground">Make workspace profile visible to others</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Default Notifications
          </CardTitle>
          <CardDescription>Default notification settings for new members</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send email for important updates</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">Send weekly summary email</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Show notifications in the app</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
            <div>
              <h4 className="font-medium">Transfer Ownership</h4>
              <p className="text-sm text-muted-foreground">Transfer this workspace to another user</p>
            </div>
            <Button variant="outline">Transfer</Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
            <div>
              <h4 className="font-medium">Delete Workspace</h4>
              <p className="text-sm text-muted-foreground">Permanently delete this workspace and all data</p>
            </div>
            <Button variant="destructive">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
