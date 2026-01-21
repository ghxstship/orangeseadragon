"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  Compass,
  TrendingUp,
  Star,
  MapPin,
  Layers,
  List,
} from "lucide-react";

interface DiscoveryItem {
  id: string;
  name: string;
  type: "vendor" | "venue" | "service" | "talent";
  description: string;
  rating: number;
  reviews: number;
  location: string;
  trending: boolean;
  tags: string[];
}

const discoveryItems: DiscoveryItem[] = [
  {
    id: "1",
    name: "Elite Audio Systems",
    type: "vendor",
    description: "Premium sound equipment rental and setup services",
    rating: 4.9,
    reviews: 234,
    location: "New York, NY",
    trending: true,
    tags: ["audio", "equipment", "premium"],
  },
  {
    id: "2",
    name: "Grand Ballroom",
    type: "venue",
    description: "Elegant venue for corporate events and galas",
    rating: 4.8,
    reviews: 156,
    location: "Los Angeles, CA",
    trending: true,
    tags: ["venue", "corporate", "elegant"],
  },
  {
    id: "3",
    name: "Creative Catering Co",
    type: "service",
    description: "Innovative culinary experiences for any event",
    rating: 4.7,
    reviews: 189,
    location: "Chicago, IL",
    trending: false,
    tags: ["catering", "food", "creative"],
  },
  {
    id: "4",
    name: "The Jazz Ensemble",
    type: "talent",
    description: "Professional jazz band for corporate and private events",
    rating: 5.0,
    reviews: 78,
    location: "Miami, FL",
    trending: true,
    tags: ["music", "jazz", "live"],
  },
  {
    id: "5",
    name: "Lighting Innovations",
    type: "vendor",
    description: "State-of-the-art lighting design and equipment",
    rating: 4.6,
    reviews: 112,
    location: "San Francisco, CA",
    trending: false,
    tags: ["lighting", "design", "equipment"],
  },
];

const typeConfig: Record<string, { color: string }> = {
  vendor: { color: "bg-blue-500" },
  venue: { color: "bg-purple-500" },
  service: { color: "bg-green-500" },
  talent: { color: "bg-orange-500" },
};

export default function DiscoveryPage() {
  const trendingCount = discoveryItems.filter((i) => i.trending).length;
  const types = Array.from(new Set(discoveryItems.map((i) => i.type)));
  const avgRating = (discoveryItems.reduce((acc, i) => acc + i.rating, 0) / discoveryItems.length).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discovery"
        description="Explore vendors, venues, and services"
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Listings"
          value={discoveryItems.length}
          icon={List}
        />
        <StatCard
          title="Trending"
          value={trendingCount}
          valueClassName="text-orange-500"
          icon={TrendingUp}
        />
        <StatCard
          title="Categories"
          value={types.length}
          icon={Layers}
        />
        <StatCard
          title="Avg Rating"
          value={avgRating}
          icon={Star}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search discovery..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="h-5 w-5" />
            Discover
          </CardTitle>
          <CardDescription>Find the perfect partners for your events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {discoveryItems.map((item) => {
              const type = typeConfig[item.type];

              return (
                <div key={item.id} className={`p-4 border rounded-lg ${item.trending ? "border-orange-500" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.trending && (
                          <Badge className="bg-orange-500 text-white">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <Badge className={`${type.color} text-white mt-1`}>{item.type}</Badge>
                      <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {item.location}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{item.rating}</span>
                      <span className="text-sm text-muted-foreground">({item.reviews} reviews)</span>
                    </div>
                    <Button size="sm">View Profile</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
