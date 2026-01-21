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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Music,
  Globe,
  DollarSign,
  Calendar,
} from "lucide-react";
import { BOOKING_STATUS, TALENT_TYPE, type BookingStatus, type TalentType } from "@/lib/enums";
import { formatCurrency, DEFAULT_CURRENCY } from "@/lib/config";

interface TalentProfile {
  id: string;
  name: string;
  talentType: TalentType;
  genres: string[];
  bio: string;
  bookingStatus: BookingStatus;
  baseFee: number;
  feeCurrency: string;
  instagram: string | null;
  spotify: string | null;
  upcomingBookings: number;
  photoUrl: string | null;
}

const talents: TalentProfile[] = [
  {
    id: "1",
    name: "DJ Pulse",
    talentType: TALENT_TYPE.DJ,
    genres: ["House", "Techno", "Electronic"],
    bio: "International DJ known for high-energy festival sets",
    bookingStatus: BOOKING_STATUS.AVAILABLE,
    baseFee: 15000,
    feeCurrency: DEFAULT_CURRENCY,
    instagram: "@djpulse",
    spotify: "djpulse",
    upcomingBookings: 3,
    photoUrl: null,
  },
  {
    id: "2",
    name: "The Midnight Collective",
    talentType: TALENT_TYPE.BAND,
    genres: ["Indie Rock", "Alternative"],
    bio: "Five-piece band with a unique blend of indie and electronic sounds",
    bookingStatus: BOOKING_STATUS.LIMITED,
    baseFee: 25000,
    feeCurrency: DEFAULT_CURRENCY,
    instagram: "@midnightcollective",
    spotify: "themidnightcollective",
    upcomingBookings: 5,
    photoUrl: null,
  },
  {
    id: "3",
    name: "Sarah Vox",
    talentType: TALENT_TYPE.SOLO_ARTIST,
    genres: ["Pop", "R&B"],
    bio: "Rising star with chart-topping singles",
    bookingStatus: BOOKING_STATUS.AVAILABLE,
    baseFee: 35000,
    feeCurrency: DEFAULT_CURRENCY,
    instagram: "@sarahvox",
    spotify: "sarahvox",
    upcomingBookings: 2,
    photoUrl: null,
  },
  {
    id: "4",
    name: "Marcus Cole",
    talentType: TALENT_TYPE.SPEAKER,
    genres: ["Keynote", "Motivation"],
    bio: "Award-winning keynote speaker and author",
    bookingStatus: BOOKING_STATUS.AVAILABLE,
    baseFee: 10000,
    feeCurrency: DEFAULT_CURRENCY,
    instagram: "@marcuscole",
    spotify: null,
    upcomingBookings: 8,
    photoUrl: null,
  },
  {
    id: "5",
    name: "Neon Dreams",
    talentType: TALENT_TYPE.DJ,
    genres: ["EDM", "Future Bass"],
    bio: "Festival headliner with millions of streams",
    bookingStatus: BOOKING_STATUS.UNAVAILABLE,
    baseFee: 50000,
    feeCurrency: DEFAULT_CURRENCY,
    instagram: "@neondreams",
    spotify: "neondreams",
    upcomingBookings: 12,
    photoUrl: null,
  },
  {
    id: "6",
    name: "Comedy Kings",
    talentType: TALENT_TYPE.COMEDIAN,
    genres: ["Stand-up", "Improv"],
    bio: "Comedy duo known for their hilarious live shows",
    bookingStatus: BOOKING_STATUS.AVAILABLE,
    baseFee: 8000,
    feeCurrency: DEFAULT_CURRENCY,
    instagram: "@comedykings",
    spotify: null,
    upcomingBookings: 4,
    photoUrl: null,
  },
];

const talentTypeConfig: Record<TalentType, { label: string; icon: string }> = {
  [TALENT_TYPE.DJ]: { label: "DJ", icon: "🎧" },
  [TALENT_TYPE.BAND]: { label: "Band", icon: "🎸" },
  [TALENT_TYPE.SOLO_ARTIST]: { label: "Solo Artist", icon: "🎤" },
  [TALENT_TYPE.SPEAKER]: { label: "Speaker", icon: "🎙️" },
  [TALENT_TYPE.MC]: { label: "MC", icon: "📢" },
  [TALENT_TYPE.PERFORMER]: { label: "Performer", icon: "🎭" },
  [TALENT_TYPE.COMEDIAN]: { label: "Comedian", icon: "😂" },
  [TALENT_TYPE.OTHER]: { label: "Other", icon: "🎪" },
};

const bookingStatusConfig: Record<BookingStatus, { label: string; color: string }> = {
  [BOOKING_STATUS.AVAILABLE]: { label: "Available", color: "bg-green-500" },
  [BOOKING_STATUS.LIMITED]: { label: "Limited", color: "bg-yellow-500" },
  [BOOKING_STATUS.UNAVAILABLE]: { label: "Unavailable", color: "bg-red-500" },
};

function formatAmount(amount: number, currency: string): string {
  return formatCurrency(amount, currency);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TalentPage() {
  const stats = {
    total: talents.length,
    available: talents.filter((t) => t.bookingStatus === BOOKING_STATUS.AVAILABLE).length,
    upcomingBookings: talents.reduce((acc, t) => acc + t.upcomingBookings, 0),
    avgFee: Math.round(talents.reduce((acc, t) => acc + t.baseFee, 0) / talents.length),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Talent</h1>
          <p className="text-muted-foreground">
            Manage artist profiles and bookings
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Talent
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Talent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.available}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {stats.upcomingBookings}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Base Fee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatAmount(stats.avgFee, DEFAULT_CURRENCY)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search talent..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <Music className="mr-2 h-4 w-4" />
          By Genre
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {talents.map((talent) => (
          <Card key={talent.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={talent.photoUrl || undefined} />
                    <AvatarFallback>{getInitials(talent.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{talent.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">
                        {talentTypeConfig[talent.talentType]?.icon}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {talentTypeConfig[talent.talentType]?.label}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Create Booking</DropdownMenuItem>
                    <DropdownMenuItem>View Rider</DropdownMenuItem>
                    <DropdownMenuItem>Contact Agent</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="mt-2">{talent.bio}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      bookingStatusConfig[talent.bookingStatus].color
                    }`}
                  />
                  <span className="text-sm">
                    {bookingStatusConfig[talent.bookingStatus].label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {talent.genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {formatAmount(talent.baseFee, talent.feeCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{talent.upcomingBookings} bookings</span>
                  </div>
                </div>

                {(talent.instagram || talent.spotify) && (
                  <div className="flex items-center gap-3 pt-2 border-t">
                    {talent.instagram && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {talent.instagram}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
