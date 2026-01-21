"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Check, X, Loader2 } from "lucide-react";

interface ConnectionRequest {
  id: string;
  name: string;
  company: string;
  role: string;
  sent_at: string;
}

export default function ConnectionsRequestsPage() {
  const [requests, setRequests] = React.useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch("/api/v1/network/connections/requests");
        if (response.ok) {
          const result = await response.json();
          setRequests(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Connection Requests</h1><p className="text-muted-foreground">Pending connection requests</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" />Pending Requests</CardTitle><CardDescription>People who want to connect</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-medium">{request.name.split(" ").map(n => n[0]).join("")}</div>
                  <div><h4 className="font-medium">{request.name}</h4><p className="text-sm text-muted-foreground">{request.role} at {request.company}</p><p className="text-xs text-muted-foreground">{request.sent_at}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm"><Check className="h-4 w-4 mr-1" />Accept</Button>
                  <Button variant="outline" size="sm"><X className="h-4 w-4 mr-1" />Decline</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
