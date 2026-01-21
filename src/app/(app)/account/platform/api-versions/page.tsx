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
import { PageHeader } from "@/components/common";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Calendar,
} from "lucide-react";

interface APIVersion {
  id: string;
  version: string;
  status: "current" | "supported" | "deprecated" | "sunset";
  releaseDate: string;
  sunsetDate?: string;
  changes: string[];
}

const apiVersions: APIVersion[] = [
  {
    id: "1",
    version: "v2.5",
    status: "current",
    releaseDate: "2024-06-01",
    changes: [
      "New Events API with enhanced filtering",
      "Batch operations for contacts",
      "Improved webhook payload structure",
      "GraphQL support (beta)",
    ],
  },
  {
    id: "2",
    version: "v2.4",
    status: "supported",
    releaseDate: "2024-03-01",
    sunsetDate: "2025-03-01",
    changes: [
      "Multi-currency support",
      "Enhanced reporting endpoints",
      "Vendor management API",
    ],
  },
  {
    id: "3",
    version: "v2.3",
    status: "supported",
    releaseDate: "2023-12-01",
    sunsetDate: "2024-12-01",
    changes: [
      "Real-time webhooks",
      "Bulk import endpoints",
      "OAuth 2.0 improvements",
    ],
  },
  {
    id: "4",
    version: "v2.0",
    status: "deprecated",
    releaseDate: "2023-06-01",
    sunsetDate: "2024-06-30",
    changes: [
      "Complete API redesign",
      "RESTful architecture",
      "JSON:API specification",
    ],
  },
  {
    id: "5",
    version: "v1.0",
    status: "sunset",
    releaseDate: "2022-01-01",
    sunsetDate: "2023-12-31",
    changes: [
      "Initial API release",
      "Basic CRUD operations",
    ],
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  current: { label: "Current", color: "bg-green-500", icon: CheckCircle },
  supported: { label: "Supported", color: "bg-blue-500", icon: CheckCircle },
  deprecated: { label: "Deprecated", color: "bg-yellow-500", icon: AlertTriangle },
  sunset: { label: "Sunset", color: "bg-red-500", icon: Clock },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function APIVersionsPage() {
  const currentVersion = apiVersions.find((v) => v.status === "current");

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Versions"
        description="Manage API version settings and view changelog"
        actions={
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Full Changelog
          </Button>
        }
      />

      <Card className="border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Current API Version
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{currentVersion?.version}</p>
              <p className="text-sm text-muted-foreground">
                Released {currentVersion && formatDate(currentVersion.releaseDate)}
              </p>
            </div>
            <div className="text-right">
              <Label>Your API Version</Label>
              <select className="block mt-1 p-2 border rounded-md bg-background">
                <option value="v2.5">v2.5 (Current)</option>
                <option value="v2.4">v2.4 (Supported)</option>
                <option value="v2.3">v2.3 (Supported)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>All API versions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiVersions.map((version) => {
              const status = statusConfig[version.status];
              const StatusIcon = status.icon;

              return (
                <div key={version.id} className={`p-4 border rounded-lg ${version.status === "deprecated" ? "border-yellow-500" : version.status === "sunset" ? "border-red-500 opacity-60" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-bold">{version.version}</h4>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Released: {formatDate(version.releaseDate)}
                        </span>
                        {version.sunsetDate && (
                          <span className={version.status === "deprecated" || version.status === "sunset" ? "text-red-500" : ""}>
                            Sunset: {formatDate(version.sunsetDate)}
                          </span>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Changes:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {version.changes.map((change, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {version.status !== "sunset" && (
                      <Button variant="outline" size="sm">
                        View Docs
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
          <CardTitle>Version Policy</CardTitle>
          <CardDescription>Our API versioning and deprecation policy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Support Period
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Each API version is supported for at least 12 months after a new version is released.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Deprecation Notice
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                We provide at least 6 months notice before deprecating any API version.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Migration Period
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Deprecated versions remain functional for 6 months to allow migration.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-purple-500" />
                Migration Guides
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Detailed migration guides are provided for each version upgrade.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
