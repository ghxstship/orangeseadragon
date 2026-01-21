"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { marketplacePageConfig } from "@/config/pages/marketplace";

interface Listing {
  id: string;
  title: string;
  provider: string;
  category: string;
  price: string;
  price_type: "hourly" | "daily" | "fixed" | "quote";
  rating: number;
  reviews: number;
  location: string;
  featured: boolean;
}

export default function MarketplacePage() {
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchListings() {
      try {
        const response = await fetch("/api/v1/marketplace");
        if (response.ok) {
          const result = await response.json();
          setListings(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch marketplace listings:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const stats = React.useMemo(() => {
    const featuredCount = listings.filter((l) => l.featured).length;
    const categories = Array.from(new Set(listings.map((l) => l.category)));
    const avgRating = listings.length > 0 ? (listings.reduce((acc, l) => acc + (l.rating || 0), 0) / listings.length).toFixed(1) : "0";

    return [
      { id: "total", label: "Total Listings", value: listings.length },
      { id: "featured", label: "Featured", value: featuredCount },
      { id: "categories", label: "Categories", value: categories.length },
      { id: "avgRating", label: "Avg Rating", value: avgRating },
    ];
  }, [listings]);

  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Action:", actionId, payload);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<Listing>
      config={marketplacePageConfig}
      data={listings}
      stats={stats}
      getRowId={(l) => l.id}
      searchFields={["title", "provider", "category", "location"]}
      onAction={handleAction}
    />
  );
}
