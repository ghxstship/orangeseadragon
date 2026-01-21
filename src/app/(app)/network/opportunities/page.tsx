"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Briefcase,
  Users,
  Handshake,
  FileText,
  Plus,
  Search,
  MapPin,
  DollarSign,
  Clock,
  ChevronRight,
  Building,
  Star,
} from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "job" | "gig" | "collaboration";
  compensation: string;
  postedAt: string;
  applicants: number;
  featured: boolean;
  remote: boolean;
}

const opportunities: Opportunity[] = [
  {
    id: "1",
    title: "Senior Event Coordinator",
    company: "Live Nation Entertainment",
    location: "Los Angeles, CA",
    type: "job",
    compensation: "$75,000 - $95,000/year",
    postedAt: "2024-06-10",
    applicants: 45,
    featured: true,
    remote: false,
  },
  {
    id: "2",
    title: "Sound Engineer - Summer Festival",
    company: "Festival Productions Inc",
    location: "Austin, TX",
    type: "gig",
    compensation: "$500/day",
    postedAt: "2024-06-12",
    applicants: 23,
    featured: true,
    remote: false,
  },
  {
    id: "3",
    title: "Event Photography Partnership",
    company: "Creative Studios",
    location: "Remote",
    type: "collaboration",
    compensation: "Revenue Share",
    postedAt: "2024-06-14",
    applicants: 12,
    featured: false,
    remote: true,
  },
  {
    id: "4",
    title: "Production Manager",
    company: "AEG Presents",
    location: "New York, NY",
    type: "job",
    compensation: "$85,000 - $110,000/year",
    postedAt: "2024-06-08",
    applicants: 67,
    featured: false,
    remote: false,
  },
  {
    id: "5",
    title: "Lighting Designer - Corporate Events",
    company: "EventTech Solutions",
    location: "Chicago, IL",
    type: "gig",
    compensation: "$400/day",
    postedAt: "2024-06-15",
    applicants: 8,
    featured: false,
    remote: false,
  },
];

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  job: { label: "Full-time", color: "bg-blue-500", icon: Briefcase },
  gig: { label: "Gig", color: "bg-green-500", icon: FileText },
  collaboration: { label: "Collaboration", color: "bg-purple-500", icon: Handshake },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function OpportunitiesPage() {
  const jobCount = opportunities.filter((o) => o.type === "job").length;
  const gigCount = opportunities.filter((o) => o.type === "gig").length;
  const collabCount = opportunities.filter((o) => o.type === "collaboration").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Opportunities"
        description="Find jobs, gigs, and collaborations in the events industry"
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post Opportunity
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Opportunities"
          value={opportunities.length}
          icon={Briefcase}
        />
        <StatCard
          title="Jobs"
          value={jobCount}
          valueClassName="text-blue-500"
          icon={Briefcase}
        />
        <StatCard
          title="Gigs"
          value={gigCount}
          valueClassName="text-green-500"
          icon={FileText}
        />
        <StatCard
          title="Collaborations"
          value={collabCount}
          valueClassName="text-purple-500"
          icon={Handshake}
        />
      </StatGrid>

      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/opportunities/jobs">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Jobs
              </CardTitle>
              <CardDescription>Full-time and part-time positions</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/opportunities/gigs">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Gigs
              </CardTitle>
              <CardDescription>Short-term freelance work</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/opportunities/collaborations">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="h-5 w-5 text-purple-500" />
                Collaborations
              </CardTitle>
              <CardDescription>Partnership opportunities</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/opportunities/my-applications">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Applications
              </CardTitle>
              <CardDescription>Track your applications</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search opportunities..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Featured Opportunities
          </CardTitle>
          <CardDescription>Top opportunities in the events industry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {opportunities.map((opportunity) => {
              const type = typeConfig[opportunity.type];
              const TypeIcon = type.icon;

              return (
                <div
                  key={opportunity.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${opportunity.featured ? "border-l-4 border-l-yellow-500" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{opportunity.title}</h4>
                        <Badge className={`${type.color} text-white`}>
                          {type.label}
                        </Badge>
                        {opportunity.featured && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {opportunity.remote && (
                          <Badge variant="secondary">Remote</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Building className="h-4 w-4" />
                        <span>{opportunity.company}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {opportunity.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {opportunity.compensation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(opportunity.postedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {opportunity.applicants} applicants
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Apply</Button>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
