"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  Locate,
  List,
  Grid3X3,
  Filter,
  Navigation,
  Building2,
  Users,
  Package,
  Calendar,
} from "lucide-react";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  type?: string;
  icon?: React.ReactNode;
  color?: string;
  data?: Record<string, unknown>;
}

export interface MapCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  markers: MapMarker[];
}

export interface MapViewProps {
  markers: MapMarker[];
  title?: string;
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  onClusterClick?: (cluster: MapCluster) => void;
  showSearch?: boolean;
  showFilters?: boolean;
  showList?: boolean;
  clusterRadius?: number;
  markerTypes?: Array<{ type: string; label: string; color: string; icon?: React.ReactNode }>;
}

const defaultMarkerTypes = [
  { type: "venue", label: "Venues", color: "hsl(var(--marker-venue))", icon: <Building2 className="h-4 w-4" /> },
  { type: "asset", label: "Assets", color: "hsl(var(--marker-asset))", icon: <Package className="h-4 w-4" /> },
  { type: "person", label: "People", color: "hsl(var(--marker-person))", icon: <Users className="h-4 w-4" /> },
  { type: "event", label: "Events", color: "hsl(var(--marker-event))", icon: <Calendar className="h-4 w-4" /> },
];

const getAbsolutePositionStyle = (x: number, y: number): React.CSSProperties => ({
  left: x,
  top: y,
});

const getMarkerBackgroundStyle = (color: string): React.CSSProperties => ({
  backgroundColor: color,
});

const getMarkerPointerStyle = (color: string): React.CSSProperties => ({
  borderTopColor: color,
});

export function MapView({
  markers,
  title,
  className,
  center = { lat: 40.7128, lng: -74.006 },
  zoom = 12,
  onMarkerClick,
  onClusterClick,
  showSearch = true,
  showFilters = true,
  showList = true,
  clusterRadius = 50,
  markerTypes = defaultMarkerTypes,
}: MapViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>(
    markerTypes.map((t) => t.type)
  );
  const [viewMode, setViewMode] = React.useState<"map" | "list" | "split">("split");
  const [selectedMarker, setSelectedMarker] = React.useState<MapMarker | null>(null);
  const [mapZoom, setMapZoom] = React.useState(zoom);
  const [mapCenter, setMapCenter] = React.useState(center);
  const mapRef = React.useRef<HTMLDivElement>(null);

  const filteredMarkers = React.useMemo(() => {
    return markers.filter((marker) => {
      const matchesSearch =
        !searchQuery ||
        marker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        marker.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !marker.type || selectedTypes.includes(marker.type);

      return matchesSearch && matchesType;
    });
  }, [markers, searchQuery, selectedTypes]);

  const clusters = React.useMemo(() => {
    if (mapZoom >= 15) return []; // No clustering at high zoom

    const clustered: MapCluster[] = [];
    const processed = new Set<string>();

    for (const marker of filteredMarkers) {
      if (processed.has(marker.id)) continue;

      const nearby = filteredMarkers.filter((m) => {
        if (processed.has(m.id)) return false;
        const distance = Math.sqrt(
          Math.pow(marker.latitude - m.latitude, 2) +
            Math.pow(marker.longitude - m.longitude, 2)
        );
        return distance < clusterRadius / Math.pow(2, mapZoom) / 1000;
      });

      if (nearby.length > 1) {
        const avgLat = nearby.reduce((sum, m) => sum + m.latitude, 0) / nearby.length;
        const avgLng = nearby.reduce((sum, m) => sum + m.longitude, 0) / nearby.length;

        clustered.push({
          id: `cluster_${marker.id}`,
          latitude: avgLat,
          longitude: avgLng,
          count: nearby.length,
          markers: nearby,
        });

        nearby.forEach((m) => processed.add(m.id));
      }
    }

    return clustered;
  }, [filteredMarkers, mapZoom, clusterRadius]);

  const unclusteredMarkers = React.useMemo(() => {
    const clusteredIds = new Set(clusters.flatMap((c) => c.markers.map((m) => m.id)));
    return filteredMarkers.filter((m) => !clusteredIds.has(m.id));
  }, [filteredMarkers, clusters]);

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    onMarkerClick?.(marker);
  };

  const handleClusterClick = (cluster: MapCluster) => {
    setMapZoom((z) => Math.min(z + 2, 18));
    setMapCenter({ lat: cluster.latitude, lng: cluster.longitude });
    onClusterClick?.(cluster);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getMarkerColor = (marker: MapMarker) => {
    if (marker.color) return marker.color;
    const typeConfig = markerTypes.find((t) => t.type === marker.type);
    return typeConfig?.color || "hsl(var(--marker-default))";
  };

  const getMarkerIcon = (marker: MapMarker) => {
    if (marker.icon) return marker.icon;
    const typeConfig = markerTypes.find((t) => t.type === marker.type);
    return typeConfig?.icon || <MapPin className="h-4 w-4" />;
  };

  const latLngToPixel = (lat: number, lng: number) => {
    const mapWidth = mapRef.current?.clientWidth || 800;
    const mapHeight = mapRef.current?.clientHeight || 600;

    const scale = Math.pow(2, mapZoom);
    const worldX = ((lng + 180) / 360) * 256 * scale;
    const worldY =
      ((1 -
        Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) /
          Math.PI) /
        2) *
      256 *
      scale;

    const centerX = ((mapCenter.lng + 180) / 360) * 256 * scale;
    const centerY =
      ((1 -
        Math.log(
          Math.tan((mapCenter.lat * Math.PI) / 180) +
            1 / Math.cos((mapCenter.lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
      256 *
      scale;

    return {
      x: worldX - centerX + mapWidth / 2,
      y: worldY - centerY + mapHeight / 2,
    };
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("map")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "split" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("split")}
              >
                <Layers className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {/* Toolbar */}
        <div className="border-b p-3 flex flex-wrap items-center gap-3">
          {showSearch && (
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {markerTypes.map((type) => (
                <Button
                  key={type.type}
                  variant={selectedTypes.includes(type.type) ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => toggleType(type.type)}
                >
                  {type.icon}
                  <span className="ml-1">{type.label}</span>
                </Button>
              ))}
            </div>
          )}

          <div className="ml-auto text-sm text-muted-foreground">
            {filteredMarkers.length} locations
          </div>
        </div>

        <div className={cn("flex", viewMode === "list" ? "flex-col" : "")}>
          {/* Map */}
          {viewMode !== "list" && (
            <div
              ref={mapRef}
              className={cn(
                "relative bg-muted/30 overflow-hidden",
                viewMode === "split" ? "flex-1" : "w-full",
                "min-h-[400px]"
              )}
            >
              {/* Map placeholder - in production, integrate with Mapbox/Google Maps */}
              <div className="absolute inset-0 bg-gradient-to-br from-semantic-info/10 to-semantic-info/20 dark:from-semantic-info/20 dark:to-semantic-info/10">
                {/* Grid lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Markers */}
                {unclusteredMarkers.map((marker) => {
                  const pos = latLngToPixel(marker.latitude, marker.longitude);
                  if (pos.x < 0 || pos.y < 0) return null;

                  const markerColor = getMarkerColor(marker);
                  const markerPosition = getAbsolutePositionStyle(pos.x, pos.y);
                  const markerBackgroundStyle = getMarkerBackgroundStyle(markerColor);
                  const markerPointerStyle = getMarkerPointerStyle(markerColor);

                  return (
                    <button
                      key={marker.id}
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 z-10",
                        selectedMarker?.id === marker.id && "scale-125 z-20"
                      )}
                      style={markerPosition}
                      onClick={() => handleMarkerClick(marker)}
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full text-white shadow-lg"
                        style={markerBackgroundStyle}
                      >
                        {getMarkerIcon(marker)}
                      </div>
                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent"
                        style={markerPointerStyle}
                      />
                    </button>
                  );
                })}

                {/* Clusters */}
                {clusters.map((cluster) => {
                  const pos = latLngToPixel(cluster.latitude, cluster.longitude);
                  if (pos.x < 0 || pos.y < 0) return null;

                  const clusterPosition = getAbsolutePositionStyle(pos.x, pos.y);

                  return (
                    <button
                      key={cluster.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 z-10"
                      style={clusterPosition}
                      onClick={() => handleClusterClick(cluster)}
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg font-bold">
                        {cluster.count}
                      </div>
                    </button>
                  );
                })}

                {/* Center marker */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-primary bg-primary/20" />
              </div>

              {/* Map controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 shadow"
                  onClick={() => setMapZoom((z) => Math.min(z + 1, 18))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 shadow"
                  onClick={() => setMapZoom((z) => Math.max(z - 1, 1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 shadow"
                  onClick={() => {
                    setMapCenter(center);
                    setMapZoom(zoom);
                  }}
                >
                  <Locate className="h-4 w-4" />
                </Button>
              </div>

              {/* Zoom level indicator */}
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur px-2 py-1 rounded text-xs">
                Zoom: {mapZoom}
              </div>

              {/* Selected marker popup */}
              {selectedMarker && (
                <div className="absolute bottom-4 right-4 w-64 bg-background border rounded-lg shadow-lg p-3">
                  {(() => {
                    const selectedMarkerColor = getMarkerColor(selectedMarker);
                    const selectedMarkerBackgroundStyle = getMarkerBackgroundStyle(selectedMarkerColor);

                    return (
                  <div className="flex items-start gap-3">
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-full text-white flex-shrink-0"
                      style={selectedMarkerBackgroundStyle}
                    >
                      {getMarkerIcon(selectedMarker)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{selectedMarker.title}</h4>
                      {selectedMarker.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {selectedMarker.description}
                        </p>
                      )}
                      {selectedMarker.type && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {markerTypes.find((t) => t.type === selectedMarker.type)?.label ||
                            selectedMarker.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                    );
                  })()}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1">
                      <Navigation className="h-3 w-3 mr-1" />
                      Directions
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedMarker(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* List */}
          {(viewMode === "list" || viewMode === "split") && showList && (
            <div
              className={cn(
                "border-l",
                viewMode === "split" ? "w-80" : "w-full",
                viewMode === "list" && "border-l-0"
              )}
            >
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {filteredMarkers.map((marker) => (
                    (() => {
                      const listMarkerColor = getMarkerColor(marker);
                      const listMarkerBackgroundStyle = getMarkerBackgroundStyle(listMarkerColor);

                      return (
                        <button
                          key={marker.id}
                          className={cn(
                            "w-full p-3 text-left hover:bg-muted/50 transition-colors flex items-start gap-3",
                            selectedMarker?.id === marker.id && "bg-muted"
                          )}
                          onClick={() => handleMarkerClick(marker)}
                        >
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-full text-white flex-shrink-0"
                            style={listMarkerBackgroundStyle}
                          >
                            {getMarkerIcon(marker)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{marker.title}</h4>
                            {marker.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {marker.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                            </p>
                          </div>
                        </button>
                      );
                    })()
                  ))}

                  {filteredMarkers.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No locations found</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
