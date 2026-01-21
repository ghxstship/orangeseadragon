"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, GraduationCap, Clock, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Training {
  id: string;
  name: string;
  type: string;
  duration: string;
  completion_rate: number;
  due_date: string;
}

export default function ComplianceTrainingPage() {
  const [trainings, setTrainings] = React.useState<Training[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTrainings() {
      try {
        const response = await fetch("/api/v1/business/compliance/training");
        if (response.ok) {
          const result = await response.json();
          setTrainings(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch trainings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrainings();
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
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Training</h1><p className="text-muted-foreground">Compliance training programs</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Training</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Programs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{trainings.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Completion</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{trainings.length > 0 ? Math.round(trainings.reduce((s, t) => s + (t.completion_rate || 0), 0) / trainings.length) : 0}%</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Due Soon</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-500">2</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" />Training Programs</CardTitle><CardDescription>Required compliance training</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainings.map((training) => (
              <div key={training.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><h4 className="font-medium">{training.name}</h4><Badge variant="outline">{training.type}</Badge></div>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Send Reminders</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{training.duration}</span>
                  <span>Due: {training.due_date}</span>
                </div>
                <div className="mt-3"><div className="flex justify-between text-sm mb-1"><span>Completion Rate</span><span>{training.completion_rate}%</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${training.completion_rate}%` }} /></div></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
