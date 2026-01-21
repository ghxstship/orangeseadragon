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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Building2,
  MapPin,
  Users,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Star,
} from "lucide-react";

interface Venue {
  id: string;
  name: string;
  type: "arena" | "theater" | "outdoor" | "ballroom" | "convention" | "club";
  address: string;
  city: string;
  state: string;
  capacity: number;
  stages: number;
  status: "active" | "pending" | "inactive";
  rating: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  amenities: string[];
  upcomingEvents: number;
}

const venues: Venue[] = [
  {
    id: "1",
    name: "City Arena",
    type: "arena",
    address: "123 Arena Way",
    city: "Los Angeles",
    state: "CA",
    capacity: 25000,
    stages: 3,
    status: "active",
    rating: 4.8,
    contactName: "Arena Manager",
    contactEmail: "events@cityarena.com",
    contactPhone: "+1 555-0200",
    website: "www.cityarena.com",
    amenities: ["Parking", "VIP Suites", "Catering", "Green Rooms", "Loading Dock"],
    upcomingEvents: 5,
  },
  {
    id: "2",
    name: "Grand Ballroom Hotel",
    type: "ballroom",
    address: "456 Luxury Blvd",
    city: "New York",
    state: "NY",
    capacity: 500,
    stages: 1,
    status: "active",
    rating: 4.9,
    contactName: "Events Director",
    contactEmail: "events@grandballroom.com",
    contactPhone: "+1 555-0201",
    website: "www.grandballroomhotel.com",
    amenities: ["Valet Parking", "Catering", "AV Equipment", "Bridal Suite"],
    upcomingEvents: 3,
  },
  {
    id: "3",
    name: "Riverside Amphitheater",
    type: "outdoor",
    address: "789 River Road",
    city: "Austin",
    state: "TX",
    capacity: 15000,
    stages: 2,
    status: "active",
    rating: 4.5,
    contactName: "Venue Coordinator",
    contactEmail: "booking@riversideamp.com",
    contactPhone: "+1 555-0202",
    amenities: ["Parking", "Concessions", "VIP Area", "Backstage"],
    upcomingEvents: 8,
  },
  {
    id: "4",
    name: "Convention Center",
    type: "convention",
    address: "100 Convention Plaza",
    city: "Chicago",
    state: "IL",
    capacity: 50000,
    stages: 10,
    status: "active",
    rating: 4.6,
    contactName: "Sales Manager",
    contactEmail: "sales@conventioncenter.com",
    contactPhone: "+1 555-0203",
    website: "www.conventioncenter.com",
    amenities: ["Parking", "Multiple Halls", "Catering", "WiFi", "AV Support"],
    upcomingEvents: 12,
  },
  {
    id: "5",
    name: "The Jazz Club",
    type: "club",
    address: "55 Music Lane",
    city: "New Orleans",
    state: "LA",
    capacity: 300,
    stages: 1,
    status: "pending",
    rating: 4.7,
    contactName: "Club Owner",
    contactEmail: "booking@jazzclub.com",
    contactPhone: "+1 555-0204",
    amenities: ["Bar", "Sound System", "Green Room"],
    upcomingEvents: 0,
  },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  arena: { label: "Arena", color: "bg-purple-500" },
  theater: { label: "Theater", color: "bg-red-500" },
  outdoor: { label: "Outdoor", color: "bg-green-500" },
  ballroom: { label: "Ballroom", color: "bg-pink-500" },
  convention: { label: "Convention", color: "bg-blue-500" },
  club: { label: "Club", color: "bg-orange-500" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "bg-green-500" },
  pending: { label: "Pending", color: "bg-yellow-500" },
  inactive: { label: "Inactive", color: "bg-gray-500" },
};

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export default function VenueManagementPage() {
  const totalCapacity = venues.reduce((acc, v) => acc + v.capacity, 0);
  const activeVenues = venues.filter((v) => v.status === "active").length;
  const totalUpcoming = venues.reduce((acc, v) => acc + v.upcomingEvents, 0);

  const stats = {
    totalVenues: venues.length,
    activeVenues,
    totalCapacity,
    totalUpcoming,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venue Management</h1>
          <p className="text-muted-foreground">
            Manage venue relationships and bookings
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Venue
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Venues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVenues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.activeVenues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalCapacity)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.totalUpcoming}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search venues..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {venues.map((venue) => {
          const type = typeConfig[venue.type];
          const status = statusConfig[venue.status];

          return (
            <Card key={venue.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {venue.name}
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-normal">{venue.rating}</span>
                        </div>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {venue.city}, {venue.state}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${type.color} text-white`}>
                      {type.label}
                    </Badge>
                    <Badge className={`${status.color} text-white`}>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Venue</DropdownMenuItem>
                        <DropdownMenuItem>View Events</DropdownMenuItem>
                        <DropdownMenuItem>View Contracts</DropdownMenuItem>
                        <DropdownMenuItem>Contact Venue</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xl font-bold">{formatNumber(venue.capacity)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Capacity</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold">{venue.stages}</p>
                    <p className="text-xs text-muted-foreground">Stages</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-500">{venue.upcomingEvents}</p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {venue.amenities.slice(0, 4).map((amenity, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {venue.amenities.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{venue.amenities.length - 4} more
                    </Badge>
                  )}
                </div>

                <div className="pt-3 border-t text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{venue.contactName}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {venue.contactEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {venue.contactPhone}
                    </span>
                    {venue.website && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {venue.website}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
