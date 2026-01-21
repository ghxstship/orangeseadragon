"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { venuesPageConfig } from "@/config/pages/venues";

interface Venue {
  id: string;
  name: string;
  description: string;
  venue_type: "indoor" | "outdoor" | "hybrid";
  address: string;
  city: string;
  capacity: number;
  rating: number;
  is_partner: boolean;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  image_url: string | null;
  amenities: string[];
}

export default function VenuesPage() {
  const [venuesData, setVenuesData] = React.useState<Venue[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchVenues() {
      try {
        const response = await fetch("/api/v1/projects/places");
        if (response.ok) {
          const result = await response.json();
          setVenuesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch venues:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, []);

  const stats = React.useMemo(() => {
    const partners = venuesData.filter((v) => v.is_partner).length;
    const totalCapacity = venuesData.reduce((acc, v) => acc + (v.capacity || 0), 0);
    const avgRating = venuesData.length > 0 
      ? (venuesData.reduce((acc, v) => acc + (v.rating || 0), 0) / venuesData.length).toFixed(1)
      : "0";
    return [
      { id: "total", label: "Total Venues", value: venuesData.length },
      { id: "partners", label: "Partner Venues", value: partners },
      { id: "capacity", label: "Total Capacity", value: totalCapacity.toLocaleString() },
      { id: "rating", label: "Avg Rating", value: avgRating },
    ];
  }, [venuesData]);

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
    <DataViewPage<Venue>
      config={venuesPageConfig}
      data={venuesData}
      stats={stats}
      getRowId={(v) => v.id}
      searchFields={["name", "city", "address"]}
      onAction={handleAction}
    />
  );
}
