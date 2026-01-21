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
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Cookie,
  Mail,
  Smartphone,
  Target,
  Users,
} from "lucide-react";

interface ConsentCategory {
  id: string;
  name: string;
  description: string;
  type: "essential" | "functional" | "analytics" | "marketing";
  required: boolean;
  consentRate: number;
  totalUsers: number;
  consented: number;
}

const consentCategories: ConsentCategory[] = [
  {
    id: "1",
    name: "Essential Cookies",
    description: "Required for basic site functionality",
    type: "essential",
    required: true,
    consentRate: 100,
    totalUsers: 12500,
    consented: 12500,
  },
  {
    id: "2",
    name: "Functional Cookies",
    description: "Remember preferences and settings",
    type: "functional",
    required: false,
    consentRate: 85,
    totalUsers: 12500,
    consented: 10625,
  },
  {
    id: "3",
    name: "Analytics Cookies",
    description: "Help us understand how you use our site",
    type: "analytics",
    required: false,
    consentRate: 72,
    totalUsers: 12500,
    consented: 9000,
  },
  {
    id: "4",
    name: "Marketing Cookies",
    description: "Used for targeted advertising",
    type: "marketing",
    required: false,
    consentRate: 45,
    totalUsers: 12500,
    consented: 5625,
  },
  {
    id: "5",
    name: "Email Marketing",
    description: "Promotional emails and newsletters",
    type: "marketing",
    required: false,
    consentRate: 62,
    totalUsers: 12500,
    consented: 7750,
  },
  {
    id: "6",
    name: "SMS Notifications",
    description: "Text message alerts and updates",
    type: "marketing",
    required: false,
    consentRate: 38,
    totalUsers: 12500,
    consented: 4750,
  },
];

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  essential: { label: "Essential", color: "bg-blue-500", icon: Cookie },
  functional: { label: "Functional", color: "bg-purple-500", icon: Cookie },
  analytics: { label: "Analytics", color: "bg-green-500", icon: Target },
  marketing: { label: "Marketing", color: "bg-orange-500", icon: Mail },
};

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function ConsentManagementPage() {
  const totalUsers = 12500;
  const avgConsentRate = Math.round(consentCategories.filter((c) => !c.required).reduce((acc, c) => acc + c.consentRate, 0) / consentCategories.filter((c) => !c.required).length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consent Management</h1>
          <p className="text-muted-foreground">
            Manage user consent preferences and compliance
          </p>
        </div>
        <Button>
          <Cookie className="mr-2 h-4 w-4" />
          Configure Banner
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalUsers)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Consent Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConsentRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Marketing Opt-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">62%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consent Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consentCategories.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consent Categories</CardTitle>
          <CardDescription>User consent by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consentCategories.map((category) => {
              const type = typeConfig[category.type];
              const TypeIcon = type.icon;

              return (
                <div key={category.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <TypeIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{category.name}</h4>
                          <Badge className={`${type.color} text-white`}>
                            {type.label}
                          </Badge>
                          {category.required && (
                            <Badge variant="outline">Required</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {formatNumber(category.consented)} / {formatNumber(category.totalUsers)} users
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right w-32">
                      <p className={`text-2xl font-bold ${category.consentRate >= 70 ? "text-green-500" : category.consentRate >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                        {category.consentRate}%
                      </p>
                      <Progress value={category.consentRate} className="h-2 mt-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consent Banner Settings</CardTitle>
            <CardDescription>Configure cookie consent popup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Consent Banner</Label>
                <p className="text-sm text-muted-foreground">Display to new visitors</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Require Explicit Consent</Label>
                <p className="text-sm text-muted-foreground">No pre-checked boxes</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Remember Preferences</Label>
                <p className="text-sm text-muted-foreground">Don&apos;t ask again after consent</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Allow Reject All</Label>
                <p className="text-sm text-muted-foreground">One-click reject option</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label>Consent Expiry</Label>
              <select className="w-full p-2 border rounded-md bg-background">
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Consent Activity</CardTitle>
            <CardDescription>Latest consent changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">Marketing consent granted</p>
                  <p className="text-xs text-muted-foreground">user@example.com • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <XCircle className="h-5 w-5 text-red-500" />
                <div className="flex-1">
                  <p className="font-medium">Analytics consent withdrawn</p>
                  <p className="text-xs text-muted-foreground">another@example.com • 4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">All cookies accepted</p>
                  <p className="text-xs text-muted-foreground">visitor@example.com • 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Smartphone className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">SMS notifications enabled</p>
                  <p className="text-xs text-muted-foreground">mobile@example.com • 6 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
