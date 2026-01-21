"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { assetsLocationsPageConfig } from "@/config/pages/assets-locations";

interface Location {
  id: string;
  name: string;
  address: string;
  type: string;
  item_count: number;
  capacity: string;
}

export default function AssetsLocationsPage() {
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch("/api/v1/assets/locations");
        if (response.ok) {
          const result = await response.json();
          setLocations(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLocations();
  }, []);

  const stats = React.useMemo(() => {
    const totalItems = locations.reduce((s, l) => s + (l.item_count || 0), 0);
    const warehouseCount = locations.filter((l) => l.type === "Warehouse").length;
    return [
      { id: "total", label: "Total Locations", value: locations.length },
      { id: "items", label: "Total Items", value: totalItems },
      { id: "warehouses", label: "Warehouses", value: warehouseCount },
    ];
  }, [locations]);

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
    <DataViewPage<Location>
      config={assetsLocationsPageConfig}
      data={locations}
      stats={stats}
      getRowId={(l) => l.id}
      searchFields={["name", "address"]}
      onAction={handleAction}
    />
  );
}
