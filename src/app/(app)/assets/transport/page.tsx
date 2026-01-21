"use client";

import * as React from "react";
import {
  Card,
  CardContent,
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
  Filter,
  Plus,
  MoreHorizontal,
  Bus,
  MapPin,
  Clock,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface TransportBooking {
  id: string;
  bookingRef: string;
  vehicleType: "shuttle" | "van" | "car" | "bus" | "limo";
  passengerName: string;
  passengerCount: number;
  eventName: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string;
  date: string;
  status: "scheduled" | "dispatched" | "in_transit" | "completed" | "cancelled";
  driver?: string;
  notes?: string;
}

const transportBookings: TransportBooking[] = [
  {
    id: "1",
    bookingRef: "TRN-001",
    vehicleType: "limo",
    passengerName: "The Headliners",
    passengerCount: 4,
    eventName: "Summer Festival 2024",
    pickupLocation: "Airport Terminal 3",
    dropoffLocation: "Grand Hotel",
    pickupTime: "14:00",
    date: "2024-06-14",
    status: "scheduled",
    driver: "John Driver",
    notes: "VIP artist - priority service",
  },
  {
    id: "2",
    bookingRef: "TRN-002",
    vehicleType: "shuttle",
    passengerName: "Crew Team A",
    passengerCount: 12,
    eventName: "Summer Festival 2024",
    pickupLocation: "Crew Hotel",
    dropoffLocation: "Festival Site",
    pickupTime: "06:00",
    date: "2024-06-15",
    status: "dispatched",
    driver: "Mike Transport",
  },
  {
    id: "3",
    bookingRef: "TRN-003",
    vehicleType: "van",
    passengerName: "Equipment Team",
    passengerCount: 6,
    eventName: "Summer Festival 2024",
    pickupLocation: "Warehouse",
    dropoffLocation: "Festival Site - Loading Dock",
    pickupTime: "05:00",
    date: "2024-06-15",
    status: "in_transit",
    driver: "Tom Van",
  },
  {
    id: "4",
    bookingRef: "TRN-004",
    vehicleType: "car",
    passengerName: "Sarah Chen",
    passengerCount: 1,
    eventName: "Corporate Gala 2024",
    pickupLocation: "Office HQ",
    dropoffLocation: "Grand Ballroom Hotel",
    pickupTime: "17:00",
    date: "2024-03-20",
    status: "completed",
    driver: "Lisa Car",
  },
  {
    id: "5",
    bookingRef: "TRN-005",
    vehicleType: "bus",
    passengerName: "Guest Group",
    passengerCount: 45,
    eventName: "Summer Festival 2024",
    pickupLocation: "Downtown Station",
    dropoffLocation: "Festival Site - Main Entrance",
    pickupTime: "16:00",
    date: "2024-06-15",
    status: "scheduled",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Clock },
  dispatched: { label: "Dispatched", color: "bg-yellow-500", icon: Bus },
  in_transit: { label: "In Transit", color: "bg-green-500", icon: Bus },
  completed: { label: "Completed", color: "bg-gray-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: AlertCircle },
};

const vehicleConfig: Record<string, { label: string; color: string }> = {
  shuttle: { label: "Shuttle", color: "bg-blue-500" },
  van: { label: "Van", color: "bg-orange-500" },
  car: { label: "Car", color: "bg-green-500" },
  bus: { label: "Bus", color: "bg-purple-500" },
  limo: { label: "Limo", color: "bg-pink-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function TransportPage() {
  const stats = {
    totalBookings: transportBookings.length,
    scheduled: transportBookings.filter((t) => t.status === "scheduled").length,
    inTransit: transportBookings.filter((t) => t.status === "dispatched" || t.status === "in_transit").length,
    totalPassengers: transportBookings.filter((t) => t.status !== "cancelled" && t.status !== "completed").reduce((acc, t) => acc + t.passengerCount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transport</h1>
          <p className="text-muted-foreground">
            Manage ground transportation and logistics
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.inTransit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Passengers Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPassengers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search transport..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {transportBookings.map((booking) => {
          const status = statusConfig[booking.status];
          const vehicle = vehicleConfig[booking.vehicleType];
          const StatusIcon = status.icon;

          return (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Bus className="h-5 w-5 text-muted-foreground" />
                      <span className="font-mono font-medium">{booking.bookingRef}</span>
                      <Badge className={`${vehicle.color} text-white`}>
                        {vehicle.label}
                      </Badge>
                      <Badge className={`${status.color} text-white`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.pickupLocation}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.dropoffLocation}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{booking.passengerName}</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {booking.passengerCount} passengers
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(booking.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.pickupTime}
                      </span>
                      {booking.driver && (
                        <span>Driver: {booking.driver}</span>
                      )}
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        {booking.notes}
                      </p>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Booking</DropdownMenuItem>
                      {booking.status === "scheduled" && (
                        <>
                          <DropdownMenuItem>Assign Driver</DropdownMenuItem>
                          <DropdownMenuItem className="text-yellow-600">Dispatch</DropdownMenuItem>
                        </>
                      )}
                      {booking.status === "dispatched" && (
                        <DropdownMenuItem className="text-green-600">Mark In Transit</DropdownMenuItem>
                      )}
                      {booking.status === "in_transit" && (
                        <DropdownMenuItem className="text-blue-600">Mark Completed</DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Send Notification</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
