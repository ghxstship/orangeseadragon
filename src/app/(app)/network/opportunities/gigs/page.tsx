"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, MapPin, DollarSign, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const gigs = [
  { id: "1", title: "Event Photographer", location: "San Francisco", pay: "$500", duration: "1 day", postedAt: "Jun 18, 2024" },
  { id: "2", title: "Sound Technician", location: "Los Angeles", pay: "$350", duration: "2 days", postedAt: "Jun 17, 2024" },
  { id: "3", title: "MC/Host", location: "Remote", pay: "$400", duration: "1 day", postedAt: "Jun 15, 2024" },
];

export default function OpportunitiesGigsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Gigs</h1><p className="text-muted-foreground">Short-term freelance work</p></div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search gigs..." className="pl-9" /></div></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Available Gigs</CardTitle><CardDescription>Freelance opportunities</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gigs.map((gig) => (
              <div key={gig.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{gig.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{gig.location}</span>
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{gig.pay}</span>
                    <span>{gig.duration}</span>
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
