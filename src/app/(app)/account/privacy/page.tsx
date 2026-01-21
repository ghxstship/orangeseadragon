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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Shield,
  FileText,
  Download,
  Eye,
  Trash2,
  Lock,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
} from "lucide-react";

interface PrivacyDocument {
  id: string;
  name: string;
  type: "policy" | "notice" | "agreement";
  version: string;
  lastUpdated: string;
  status: "active" | "draft" | "archived";
}

const privacyDocuments: PrivacyDocument[] = [
  {
    id: "1",
    name: "Privacy Policy",
    type: "policy",
    version: "3.2",
    lastUpdated: "2024-06-01",
    status: "active",
  },
  {
    id: "2",
    name: "Cookie Policy",
    type: "policy",
    version: "2.1",
    lastUpdated: "2024-05-15",
    status: "active",
  },
  {
    id: "3",
    name: "Terms of Service",
    type: "agreement",
    version: "4.0",
    lastUpdated: "2024-04-20",
    status: "active",
  },
  {
    id: "4",
    name: "Data Processing Agreement",
    type: "agreement",
    version: "1.5",
    lastUpdated: "2024-03-10",
    status: "active",
  },
  {
    id: "5",
    name: "Privacy Notice - Events",
    type: "notice",
    version: "2.0",
    lastUpdated: "2024-06-10",
    status: "active",
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  policy: { label: "Policy", color: "bg-blue-500" },
  notice: { label: "Notice", color: "bg-purple-500" },
  agreement: { label: "Agreement", color: "bg-green-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PrivacyCenterPage() {
  const activeDocuments = privacyDocuments.filter((d) => d.status === "active").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Privacy Center"
        description="Manage privacy settings and documentation"
        actions={
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Create Document
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Active Documents"
          value={activeDocuments}
          icon={FileText}
        />
        <StatCard
          title="Last Updated"
          value="June 10, 2024"
          icon={Calendar}
        />
        <StatCard
          title="Compliance Score"
          value="98%"
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Pending Requests"
          value={3}
          valueClassName="text-yellow-500"
          icon={Clock}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Privacy Documents</CardTitle>
            <CardDescription>Legal and privacy documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {privacyDocuments.map((doc) => {
                const type = typeConfig[doc.type];

                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{doc.name}</h4>
                          <Badge className={`${type.color} text-white`}>
                            {type.label}
                          </Badge>
                          <Badge variant="outline">v{doc.version}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Updated: {formatDate(doc.lastUpdated)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Privacy management tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Eye className="mr-2 h-4 w-4" />
              View My Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              Export My Data
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Trash2 className="mr-2 h-4 w-4" />
              Request Deletion
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Lock className="mr-2 h-4 w-4" />
              Manage Consent
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Security Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Privacy Rights
          </CardTitle>
          <CardDescription>Under GDPR and CCPA, you have the following rights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                Right to Access
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Request a copy of your personal data
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Right to Rectification
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Correct inaccurate personal data
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-500" />
                Right to Erasure
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Request deletion of your data
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Download className="h-4 w-4 text-green-500" />
                Right to Portability
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Receive your data in a portable format
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-orange-500" />
                Right to Restrict
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Limit how we process your data
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-500" />
                Right to Object
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Object to certain processing activities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
