"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Briefcase, Mail, Phone, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Contractor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  rate: string;
  status: string;
}

export default function PeopleContractorsPage() {
  const [contractors, setContractors] = React.useState<Contractor[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchContractors() {
      try {
        const response = await fetch("/api/v1/people/contractors");
        if (response.ok) {
          const result = await response.json();
          setContractors(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch contractors:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContractors();
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
        <div><h1 className="text-3xl font-bold tracking-tight">Contractors</h1><p className="text-muted-foreground">External contractors and freelancers</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Contractor</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search contractors..." className="pl-9" /></div></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Contractors</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{contractors.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{contractors.filter(c => c.status === "active").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gray-500">{contractors.filter(c => c.status === "inactive").length}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Contractor List</CardTitle><CardDescription>External team members</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contractors.map((contractor) => (
              <div key={contractor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-medium">{contractor.name.split(" ").map(n => n[0]).join("")}</div>
                  <div>
                    <div className="flex items-center gap-2"><h4 className="font-medium">{contractor.name}</h4><Badge variant={contractor.status === "active" ? "default" : "secondary"}>{contractor.status}</Badge></div>
                    <p className="text-sm text-muted-foreground">{contractor.specialty} • {contractor.rate}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{contractor.email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{contractor.phone}</span>
                    </div>
                  </div>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>View Profile</DropdownMenuItem><DropdownMenuItem>Book</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
