"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, MapPin, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const jobs = [
  { id: "1", title: "Event Manager", company: "Events Pro", location: "San Francisco", type: "Full-time", salary: "$80K-$100K", postedAt: "Jun 18, 2024" },
  { id: "2", title: "Marketing Coordinator", company: "Marketing Co", location: "Remote", type: "Full-time", salary: "$60K-$75K", postedAt: "Jun 15, 2024" },
  { id: "3", title: "Production Assistant", company: "Stage Masters", location: "Los Angeles", type: "Part-time", salary: "$25/hr", postedAt: "Jun 12, 2024" },
];

export default function OpportunitiesJobsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Jobs</h1><p className="text-muted-foreground">Full-time and part-time positions</p></div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search jobs..." className="pl-9" /></div></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Job Listings</CardTitle><CardDescription>Available positions</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{job.title}</h4><Badge variant="outline">{job.type}</Badge></div>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                    <span>{job.salary}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm">Apply</Button>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem>Save</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
