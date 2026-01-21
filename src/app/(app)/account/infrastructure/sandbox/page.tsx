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
  RefreshCw,
  Trash2,
  Database,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface SandboxData {
  type: string;
  count: number;
  lastReset: string;
}

const sandboxData: SandboxData[] = [
  { type: "Events", count: 25, lastReset: "2024-06-15T10:00:00" },
  { type: "Contacts", count: 150, lastReset: "2024-06-15T10:00:00" },
  { type: "Invoices", count: 45, lastReset: "2024-06-15T10:00:00" },
  { type: "Vendors", count: 20, lastReset: "2024-06-15T10:00:00" },
  { type: "Transactions", count: 200, lastReset: "2024-06-15T10:00:00" },
  { type: "Users", count: 10, lastReset: "2024-06-15T10:00:00" },
];

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SandboxPage() {
  const totalRecords = sandboxData.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sandbox Environment</h1>
          <p className="text-muted-foreground">
            Test your integrations safely with sample data
          </p>
        </div>
        <Badge className="bg-yellow-500 text-white">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Sandbox Mode
        </Badge>
      </div>

      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <div>
              <h3 className="font-medium">You are in Sandbox Mode</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All API calls and data changes in this environment are isolated and will not affect your production data.
                Use the test API keys below for your integrations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Environment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">Sandbox</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Test Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              API Calls Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Reset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">June 15, 10:00 AM</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Test API Keys
            </CardTitle>
            <CardDescription>Use these keys for sandbox testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Publishable Key</Label>
              <div className="flex gap-2">
                <Input value="atlvs_test_pk_xxxxxxxxxxxxxxxx" readOnly className="font-mono" />
                <Button variant="outline">Copy</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secret Key</Label>
              <div className="flex gap-2">
                <Input value="atlvs_test_sk_••••••••••••••••" readOnly className="font-mono" type="password" />
                <Button variant="outline">Reveal</Button>
                <Button variant="outline">Copy</Button>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate Keys
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Test Data
            </CardTitle>
            <CardDescription>Sample data in your sandbox</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sandboxData.map((data, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                  <div>
                    <p className="font-medium">{data.type}</p>
                    <p className="text-xs text-muted-foreground">
                      Last reset: {formatDateTime(data.lastReset)}
                    </p>
                  </div>
                  <Badge variant="outline">{data.count} records</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sandbox Settings</CardTitle>
          <CardDescription>Configure your test environment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-reset Daily</Label>
              <p className="text-sm text-muted-foreground">Reset sandbox data every 24 hours</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Simulate Errors</Label>
              <p className="text-sm text-muted-foreground">Randomly return error responses for testing</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Webhook Logging</Label>
              <p className="text-sm text-muted-foreground">Log all webhook events for debugging</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <Label>Rate Limiting</Label>
              <p className="text-sm text-muted-foreground">Apply production rate limits in sandbox</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset All Data
            </Button>
            <Button variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Seed Sample Data
            </Button>
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              View API Logs
            </Button>
            <Button variant="outline" className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
          <CardDescription>Pre-configured test scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h4 className="font-medium">Successful Payment</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Test card: 4242 4242 4242 4242</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h4 className="font-medium">Declined Payment</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Test card: 4000 0000 0000 0002</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <h4 className="font-medium">Pending Payment</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Test card: 4000 0000 0000 3220</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
