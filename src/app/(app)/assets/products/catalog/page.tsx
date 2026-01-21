"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, ShoppingBag, DollarSign, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CatalogItem {
  id: string;
  name: string;
  type: string;
  price: string;
  category: string;
  status: string;
}

export default function ProductsCatalogPage() {
  const [catalogItems, setCatalogItems] = React.useState<CatalogItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCatalog() {
      try {
        const response = await fetch("/api/v1/assets/products/catalog");
        if (response.ok) {
          const result = await response.json();
          setCatalogItems(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch catalog:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
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
        <div><h1 className="text-3xl font-bold tracking-tight">Catalog</h1><p className="text-muted-foreground">Complete product and service catalog</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Item</Button>
      </div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search catalog..." className="pl-9" /></div></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" />Product Catalog</CardTitle><CardDescription>All products and services</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {catalogItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{item.name}</h4><Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge></div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <Badge variant="outline">{item.type}</Badge>
                    <Badge variant="outline">{item.category}</Badge>
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{item.price}</span>
                  </div>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>View</DropdownMenuItem><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
