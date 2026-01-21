"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Store, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface MyListing {
  id: string;
  name: string;
  price: string;
  status: string;
  views: number;
  bookings: number;
}

export default function MarketplaceMyListingsPage() {
  const [myListings, setMyListings] = React.useState<MyListing[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMyListings() {
      try {
        const response = await fetch("/api/v1/network/marketplace/my-listings");
        if (response.ok) {
          const result = await response.json();
          setMyListings(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch my listings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyListings();
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
        <div><h1 className="text-3xl font-bold tracking-tight">My Listings</h1><p className="text-muted-foreground">Your marketplace listings</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />New Listing</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" />Your Listings</CardTitle><CardDescription>Items you are offering</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myListings.map((listing) => (
              <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{listing.name}</h4><Badge variant={listing.status === "active" ? "default" : "secondary"}>{listing.status}</Badge></div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{listing.price}</span>
                    <span>{listing.views} views</span>
                    <span>{listing.bookings} bookings</span>
                  </div>
                </div>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem>Edit</DropdownMenuItem><DropdownMenuItem>Pause</DropdownMenuItem><DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
