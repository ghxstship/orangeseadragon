"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Timesheet {
  id: string;
  employee: string;
  period: string;
  hours: number;
  status: string;
  submitted: string;
}

export default function JobsTimesheetsPage() {
  const [timesheets, setTimesheets] = React.useState<Timesheet[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTimesheets() {
      try {
        const response = await fetch("/api/v1/business/jobs/timesheets");
        if (response.ok) {
          const result = await response.json();
          setTimesheets(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch timesheets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTimesheets();
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
      <div><h1 className="text-3xl font-bold tracking-tight">Timesheets</h1><p className="text-muted-foreground">Time tracking and approvals</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-500">{timesheets.filter(t => t.status === "pending").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{timesheets.filter(t => t.status === "approved").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{timesheets.reduce((s, t) => s + t.hours, 0)}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Recent Timesheets</CardTitle><CardDescription>Submitted timesheets</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timesheets.map((timesheet) => (
              <div key={timesheet.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{timesheet.employee}</h4><Badge variant={timesheet.status === "approved" ? "default" : "secondary"}>{timesheet.status}</Badge></div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{timesheet.period}</span>
                    <span>{timesheet.hours} hours</span>
                  </div>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem>Approve</DropdownMenuItem><DropdownMenuItem>Reject</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
