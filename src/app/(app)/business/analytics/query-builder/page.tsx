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
import { PageHeader } from "@/components/common";
import {
  Play,
  Save,
  Clock,
  Database,
  Code,
} from "lucide-react";

interface SavedQuery {
  id: string;
  name: string;
  description: string;
  lastRun: string;
  avgDuration: string;
  rows: number;
}

const savedQueries: SavedQuery[] = [
  {
    id: "1",
    name: "Active Users Report",
    description: "Users active in the last 30 days",
    lastRun: "2024-06-15T15:00:00",
    avgDuration: "1.2s",
    rows: 12500,
  },
  {
    id: "2",
    name: "Revenue by Event Type",
    description: "Revenue breakdown by event category",
    lastRun: "2024-06-15T14:30:00",
    avgDuration: "2.5s",
    rows: 156,
  },
  {
    id: "3",
    name: "Vendor Performance",
    description: "Vendor ratings and completion rates",
    lastRun: "2024-06-14T10:00:00",
    avgDuration: "0.8s",
    rows: 89,
  },
];

export default function QueryBuilderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Query Builder"
        description="Build and run custom data queries"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Query Editor
              </CardTitle>
              <CardDescription>Write your SQL query</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg font-mono text-sm min-h-[200px]">
                  <pre className="text-muted-foreground">
{`SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(e.id) as event_count
FROM users u
LEFT JOIN events e ON e.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name, u.email
ORDER BY event_count DESC
LIMIT 100;`}
                  </pre>
                </div>
                <div className="flex items-center gap-2">
                  <Button>
                    <Play className="mr-2 h-4 w-4" />
                    Run Query
                  </Button>
                  <Button variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <div className="flex-1" />
                  <Badge variant="outline">
                    <Clock className="mr-1 h-3 w-3" />
                    Est. 1.5s
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>Query output</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left font-medium">id</th>
                      <th className="p-2 text-left font-medium">name</th>
                      <th className="p-2 text-left font-medium">email</th>
                      <th className="p-2 text-left font-medium">event_count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-2 font-mono">1</td>
                      <td className="p-2">Sarah Chen</td>
                      <td className="p-2">sarah@example.com</td>
                      <td className="p-2">156</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 font-mono">2</td>
                      <td className="p-2">Mike Johnson</td>
                      <td className="p-2">mike@example.com</td>
                      <td className="p-2">89</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2 font-mono">3</td>
                      <td className="p-2">Emily Watson</td>
                      <td className="p-2">emily@example.com</td>
                      <td className="p-2">67</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>3 rows returned</span>
                <span>Executed in 0.8s</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Schema
              </CardTitle>
              <CardDescription>Available tables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["users", "events", "bookings", "transactions", "vendors"].map((table) => (
                  <div key={table} className="p-2 border rounded hover:bg-muted cursor-pointer">
                    <span className="font-mono text-sm">{table}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Queries</CardTitle>
              <CardDescription>Your saved queries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedQueries.map((query) => (
                  <div key={query.id} className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">{query.name}</h4>
                    <p className="text-xs text-muted-foreground">{query.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{query.avgDuration}</span>
                      <span>•</span>
                      <span>{query.rows.toLocaleString()} rows</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
