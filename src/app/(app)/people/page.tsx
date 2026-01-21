"use client";

import * as React from "react";
import {
  Card,
  CardContent,
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
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  UserCheck,
  Clock,
  Loader2,
} from "lucide-react";

interface Person {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
  status: string;
  avatar: string | null;
  certifications: string[];
  availability: string;
}

const availabilityConfig: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "bg-green-500" },
  on_shift: { label: "On Shift", color: "bg-blue-500" },
  unavailable: { label: "Unavailable", color: "bg-gray-500" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function PeoplePage() {
  const [people, setPeople] = React.useState<Person[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPeople() {
      try {
        const response = await fetch("/api/v1/people");
        if (response.ok) {
          const result = await response.json();
          setPeople(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch people:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPeople();
  }, []);

  const stats = {
    total: people.length,
    active: people.filter((p) => p.status === "active").length,
    available: people.filter((p) => p.availability === "available").length,
    onShift: people.filter((p) => p.availability === "on_shift").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="People"
        description="Manage your team and workforce"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Person
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Team"
          value={stats.total}
          icon={Users}
        />
        <StatCard
          title="Active Members"
          value={stats.active}
          valueClassName="text-green-500"
          icon={CheckCircle}
        />
        <StatCard
          title="Available Now"
          value={stats.available}
          valueClassName="text-blue-500"
          icon={UserCheck}
        />
        <StatCard
          title="On Shift"
          value={stats.onShift}
          valueClassName="text-purple-500"
          icon={Clock}
        />
      </StatGrid>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search people..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Availability
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {people.map((person) => (
          <Card key={person.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={person.avatar || undefined} />
                      <AvatarFallback>{getInitials(person.full_name)}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background ${
                        availabilityConfig[person.availability].color
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{person.full_name}</p>
                    <p className="text-sm text-muted-foreground">{person.role}</p>
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
                    <DropdownMenuItem>Send Message</DropdownMenuItem>
                    <DropdownMenuItem>Assign to Project</DropdownMenuItem>
                    <DropdownMenuItem>View Schedule</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 space-y-2">
                <Badge variant="outline">{person.department}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{person.email}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{person.phone}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{person.location}</span>
                </div>
              </div>

              {person.certifications.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {person.certifications.slice(0, 2).map((cert) => (
                    <Badge key={cert} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                  {person.certifications.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{person.certifications.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
