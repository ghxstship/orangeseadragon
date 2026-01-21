"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import { Download, FileText, Calendar, CheckCircle, Loader2 } from "lucide-react";

interface ExportItem {
  id: string;
  name: string;
  format: string;
  size: string;
  created_at: string;
  status: string;
}

export default function AccountPlatformExportPage() {
  const [exports, setExports] = React.useState<ExportItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchExports() {
      try {
        const response = await fetch("/api/v1/account/platform/export");
        if (response.ok) {
          const result = await response.json();
          setExports(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch exports:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchExports();
  }, []);

  const readyCount = exports.filter((e) => e.status === "ready").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Export"
        description="Export your data"
        actions={
          <Button>
            <Download className="h-4 w-4 mr-2" />
            New Export
          </Button>
        }
      />

      <StatGrid columns={3}>
        <StatCard
          title="Total Exports"
          value={exports.length}
          icon={FileText}
        />
        <StatCard
          title="Ready"
          value={readyCount}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Downloads"
          value={exports.length}
          icon={Download}
        />
      </StatGrid>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Export History</CardTitle><CardDescription>Previous data exports</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exports.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{exp.name}</h4><Badge variant="outline">{exp.format}</Badge><Badge variant={exp.status === "ready" ? "default" : "secondary"}>{exp.status}</Badge></div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{exp.size}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{exp.created_at}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled={exp.status !== "ready"}><Download className="h-3 w-3 mr-2" />Download</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
