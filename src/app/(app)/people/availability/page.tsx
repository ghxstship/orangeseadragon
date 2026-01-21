"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, Loader2 } from "lucide-react";

interface AvailabilityItem {
  id: string;
  name: string;
  status: string;
  schedule: string;
  next_available: string;
}

export default function PeopleAvailabilityPage() {
  const [availability, setAvailability] = React.useState<AvailabilityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch("/api/v1/people/availability");
        if (response.ok) {
          const result = await response.json();
          setAvailability(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
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
      <div><h1 className="text-3xl font-bold tracking-tight">Availability</h1><p className="text-muted-foreground">Team member availability</p></div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." className="pl-9" /></div></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Available Now</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{availability.filter(a => a.status === "available").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Busy</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-500">{availability.filter(a => a.status === "busy").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Away</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gray-500">{availability.filter(a => a.status === "away").length}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Team Availability</CardTitle><CardDescription>Current status of team members</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availability.map((person) => (
              <div key={person.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${person.status === "available" ? "bg-green-500" : person.status === "busy" ? "bg-yellow-500" : "bg-gray-400"}`} />
                  <div>
                    <h4 className="font-medium">{person.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{person.schedule}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={person.status === "available" ? "default" : "secondary"}>{person.status}</Badge>
                  <span className="text-sm text-muted-foreground">Next: {person.next_available}</span>
                  <Button variant="outline" size="sm">Schedule</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
