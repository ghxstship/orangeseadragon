"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Store, Star, Loader2 } from "lucide-react";

interface Listing {
  id: string;
  name: string;
  vendor: string;
  price: string;
  rating: number;
  reviews: number;
  category: string;
}

export default function MarketplaceBrowsePage() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchListings() {
      try {
        const response = await fetch("/api/v1/network/marketplace/browse");
        if (response.ok) {
          const result = await response.json();
          setListings(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch listings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
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
      <div><h1 className="text-3xl font-bold tracking-tight">Browse Marketplace</h1><p className="text-muted-foreground">Find equipment and services</p></div>
      <div className="flex items-center gap-4"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search marketplace..." className="pl-9" /></div></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardHeader className="pb-2">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-2"><Store className="h-12 w-12 text-muted-foreground" /></div>
              <CardTitle className="text-lg">{listing.name}</CardTitle>
              <CardDescription>{listing.vendor}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{listing.category}</Badge>
                <span className="flex items-center gap-1 text-sm"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{listing.rating} ({listing.reviews})</span>
              </div>
              <p className="font-bold text-lg">{listing.price}</p>
              <Button className="w-full mt-2">Book Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
