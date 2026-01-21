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
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/common";
import {
  Play,
  Copy,
  Clock,
  CheckCircle,
  Code,
} from "lucide-react";

const endpoints = [
  { method: "GET", path: "/api/v2/events", description: "List all events" },
  { method: "POST", path: "/api/v2/events", description: "Create an event" },
  { method: "GET", path: "/api/v2/contacts", description: "List contacts" },
  { method: "POST", path: "/api/v2/contacts", description: "Create a contact" },
  { method: "GET", path: "/api/v2/invoices", description: "List invoices" },
  { method: "GET", path: "/api/v2/vendors", description: "List vendors" },
];

const methodColors: Record<string, string> = {
  GET: "bg-green-500",
  POST: "bg-blue-500",
  PUT: "bg-yellow-500",
  PATCH: "bg-orange-500",
  DELETE: "bg-red-500",
};

const sampleResponse = `{
  "data": [
    {
      "id": "evt_123abc",
      "name": "Summer Music Festival",
      "date": "2024-07-15",
      "venue": "Central Park",
      "status": "confirmed",
      "capacity": 5000,
      "created_at": "2024-06-01T10:30:00Z"
    },
    {
      "id": "evt_456def",
      "name": "Tech Conference 2024",
      "date": "2024-08-20",
      "venue": "Convention Center",
      "status": "planning",
      "capacity": 2000,
      "created_at": "2024-06-05T14:00:00Z"
    }
  ],
  "meta": {
    "total": 24,
    "page": 1,
    "per_page": 10
  }
}`;

export default function APIPlaygroundPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="API Playground"
        description="Test API endpoints interactively"
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Endpoints</CardTitle>
            <CardDescription>Select an endpoint to test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {endpoints.map((endpoint, idx) => (
                <Button key={idx} variant="ghost" className="w-full justify-start text-left h-auto py-2">
                  <div className="flex items-center gap-2 w-full">
                    <Badge className={`${methodColors[endpoint.method]} text-white text-xs`}>
                      {endpoint.method}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs truncate">{endpoint.path}</p>
                      <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <select className="p-2 border rounded-md bg-background w-24">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
              <Input defaultValue="https://api.atlvs.com/api/v2/events" className="flex-1 font-mono" />
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Headers</Label>
                <Textarea
                  className="font-mono text-sm h-32"
                  defaultValue={`Authorization: Bearer atlvs_test_xxx\nContent-Type: application/json`}
                />
              </div>
              <div className="space-y-2">
                <Label>Query Parameters</Label>
                <Textarea
                  className="font-mono text-sm h-32"
                  placeholder="page=1&#10;per_page=10&#10;status=confirmed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Request Body (for POST/PUT/PATCH)</Label>
              <Textarea
                className="font-mono text-sm h-32"
                placeholder='{"name": "New Event", "date": "2024-07-01"}'
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Response</CardTitle>
              <CardDescription>API response will appear here</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  200 OK
                </Badge>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  124ms
                </span>
              </div>
              <Button variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
            <pre className="font-mono text-sm">{sampleResponse}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Code Examples
          </CardTitle>
          <CardDescription>Copy code snippets for your integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm">cURL</Button>
            <Button variant="outline" size="sm">JavaScript</Button>
            <Button variant="outline" size="sm">Python</Button>
            <Button variant="outline" size="sm">Ruby</Button>
            <Button variant="outline" size="sm">PHP</Button>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="font-mono text-sm">{`curl -X GET "https://api.atlvs.com/api/v2/events" \\
  -H "Authorization: Bearer atlvs_test_xxx" \\
  -H "Content-Type: application/json"`}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
