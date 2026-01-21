"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Award, Calendar, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Certification {
  id: string;
  name: string;
  certification: string;
  issuer: string;
  expires_at: string;
  status: string;
}

export default function PeopleCertificationsPage() {
  const [certifications, setCertifications] = React.useState<Certification[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCertifications() {
      try {
        const response = await fetch("/api/v1/people/certifications");
        if (response.ok) {
          const result = await response.json();
          setCertifications(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch certifications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCertifications();
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
        <div><h1 className="text-3xl font-bold tracking-tight">Certifications</h1><p className="text-muted-foreground">Team certifications and credentials</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Certification</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." className="pl-9" /></div></div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Certifications</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{certifications.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{certifications.filter(c => c.status === "active").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-500">{certifications.filter(c => c.status === "expiring").length}</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />All Certifications</CardTitle><CardDescription>Team credentials</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{cert.name}</h4><Badge variant={cert.status === "active" ? "default" : "secondary"}>{cert.status}</Badge></div>
                  <p className="text-sm font-medium mt-1">{cert.certification}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Issuer: {cert.issuer}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Expires: {cert.expires_at}</span>
                  </div>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>View Details</DropdownMenuItem><DropdownMenuItem>Renew</DropdownMenuItem><DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
