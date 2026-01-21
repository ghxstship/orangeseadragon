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
  MapPin,
  Calendar,
  User,
  CheckCircle,
  Clock,
  FileText,
  Camera,
} from "lucide-react";

interface SiteSurvey {
  id: string;
  venueName: string;
  venueAddress: string;
  eventName: string;
  surveyDate: string;
  surveyedBy: string;
  status: "scheduled" | "in_progress" | "completed" | "needs_followup";
  findings: number;
  photos: number;
  notes?: string;
}

const siteSurveys: SiteSurvey[] = [
  {
    id: "1",
    venueName: "City Arena",
    venueAddress: "123 Main St, Downtown",
    eventName: "Summer Festival 2024",
    surveyDate: "2024-01-20",
    surveyedBy: "Mike Johnson",
    status: "scheduled",
    findings: 0,
    photos: 0,
  },
  {
    id: "2",
    venueName: "Grand Ballroom Hotel",
    venueAddress: "456 Park Ave, Midtown",
    eventName: "Corporate Gala 2024",
    surveyDate: "2024-01-15",
    surveyedBy: "Sarah Chen",
    status: "completed",
    findings: 8,
    photos: 24,
    notes: "Excellent venue, minor accessibility concerns noted",
  },
  {
    id: "3",
    venueName: "Convention Center",
    venueAddress: "789 Convention Blvd",
    eventName: "Tech Conference 2024",
    surveyDate: "2024-01-18",
    surveyedBy: "Tom Wilson",
    status: "in_progress",
    findings: 5,
    photos: 12,
  },
  {
    id: "4",
    venueName: "Outdoor Amphitheater",
    venueAddress: "321 Park Lane",
    eventName: "New Year Concert 2024",
    surveyDate: "2024-01-10",
    surveyedBy: "Emily Watson",
    status: "needs_followup",
    findings: 12,
    photos: 35,
    notes: "Weather protection and power supply need verification",
  },
  {
    id: "5",
    venueName: "Rooftop Terrace",
    venueAddress: "555 Sky Tower",
    eventName: "Product Launch",
    surveyDate: "2024-01-08",
    surveyedBy: "Lisa Park",
    status: "completed",
    findings: 4,
    photos: 18,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Calendar },
  in_progress: { label: "In Progress", color: "bg-yellow-500", icon: Clock },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  needs_followup: { label: "Needs Follow-up", color: "bg-orange-500", icon: Clock },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SiteSurveysPage() {
  const stats = {
    totalSurveys: siteSurveys.length,
    scheduled: siteSurveys.filter((s) => s.status === "scheduled").length,
    completed: siteSurveys.filter((s) => s.status === "completed").length,
    needsFollowup: siteSurveys.filter((s) => s.status === "needs_followup").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Surveys</h1>
          <p className="text-muted-foreground">
            Venue inspections and site assessments
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Survey
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Surveys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSurveys}</div>
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
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.needsFollowup}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search surveys..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        {siteSurveys.map((survey) => {
          const status = statusConfig[survey.status];
          const StatusIcon = status.icon;

          return (
            <Card key={survey.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">{survey.venueName}</h3>
                      <Badge className={`${status.color} text-white`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {survey.venueAddress}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{survey.eventName}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(survey.surveyDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {survey.surveyedBy}
                      </span>
                    </div>
                    {survey.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        &quot;{survey.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium text-foreground">{survey.findings}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Findings</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Camera className="h-4 w-4" />
                          <span className="font-medium text-foreground">{survey.photos}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Photos</p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Survey</DropdownMenuItem>
                        <DropdownMenuItem>View Photos</DropdownMenuItem>
                        <DropdownMenuItem>Download Report</DropdownMenuItem>
                        {survey.status === "scheduled" && (
                          <DropdownMenuItem>Start Survey</DropdownMenuItem>
                        )}
                        {survey.status === "in_progress" && (
                          <DropdownMenuItem>Complete Survey</DropdownMenuItem>
                        )}
                        {survey.status === "needs_followup" && (
                          <DropdownMenuItem>Schedule Follow-up</DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
