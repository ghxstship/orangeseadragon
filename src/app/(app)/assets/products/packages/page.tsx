"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package, DollarSign, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface PackageItem {
  id: string;
  name: string;
  description: string;
  price: string;
  services: number;
  popular: boolean;
}

export default function ProductsPackagesPage() {
  const [packages, setPackages] = React.useState<PackageItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPackages() {
      try {
        const response = await fetch("/api/v1/assets/products/packages");
        if (response.ok) {
          const result = await response.json();
          setPackages(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch packages:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
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
        <div><h1 className="text-3xl font-bold tracking-tight">Packages</h1><p className="text-muted-foreground">Service bundles and packages</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Package</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search packages..." className="pl-9" /></div></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Package Offerings</CardTitle><CardDescription>Bundled service packages</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`p-4 border rounded-lg ${pkg.popular ? "border-primary" : ""}`}>
                {pkg.popular && <Badge className="mb-2">Most Popular</Badge>}
                <div className="flex items-start justify-between">
                  <div><h4 className="font-medium">{pkg.name}</h4><p className="text-sm text-muted-foreground">{pkg.description}</p></div>
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Duplicate</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold flex items-center"><DollarSign className="h-5 w-5" />{pkg.price.replace("$", "")}</p>
                  <p className="text-sm text-muted-foreground">{pkg.services} services included</p>
                </div>
                <Button variant={pkg.popular ? "default" : "outline"} className="w-full mt-4">View Details</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
