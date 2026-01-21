"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Boxes, Package, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Kit {
  id: string;
  name: string;
  description: string;
  items: number;
  available: number;
  value: number;
}

export default function AssetsKitsPage() {
  const [kits, setKits] = React.useState<Kit[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchKits() {
      try {
        const response = await fetch("/api/v1/assets/kits");
        if (response.ok) {
          const result = await response.json();
          setKits(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch kits:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchKits();
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
        <div><h1 className="text-3xl font-bold tracking-tight">Equipment Kits</h1><p className="text-muted-foreground">Pre-configured equipment bundles</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Kit</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search kits..." className="pl-9" /></div></div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Kits</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{kits.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">{kits.reduce((s, k) => s + k.available, 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{kits.reduce((s, k) => s + k.items, 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${(kits.reduce((s, k) => s + k.value, 0) / 1000).toFixed(0)}K</div></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Boxes className="h-5 w-5" />All Kits</CardTitle><CardDescription>Equipment bundles</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {kits.map((kit) => (
              <div key={kit.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div><h4 className="font-medium">{kit.name}</h4><p className="text-sm text-muted-foreground">{kit.description}</p></div>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>View Contents</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Check Out</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline"><Package className="h-3 w-3 mr-1" />{kit.items} items</Badge>
                  <span className="text-sm text-muted-foreground">{kit.available} available</span>
                  <span className="text-sm font-medium">${kit.value.toLocaleString()}</span>
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full">Reserve Kit</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
