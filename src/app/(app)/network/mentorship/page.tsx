"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { mentorshipPageConfig } from "@/config/pages/mentorship";

interface Mentor {
  id: string;
  name: string;
  title: string;
  expertise: string[];
  rating: number;
  sessions: number;
  availability: "available" | "limited" | "unavailable";
  hourly_rate: number;
  bio: string;
}

export default function MentorshipPage() {
  const [mentorsData, setMentorsData] = React.useState<Mentor[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMentors() {
      try {
        const response = await fetch("/api/v1/mentorship");
        if (response.ok) {
          const result = await response.json();
          setMentorsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMentors();
  }, []);

  const stats = React.useMemo(() => {
    const availableMentors = mentorsData.filter((m) => m.availability === "available").length;
    const totalSessions = mentorsData.reduce((acc, m) => acc + (m.sessions || 0), 0);
    const avgRating = mentorsData.length > 0 ? (mentorsData.reduce((acc, m) => acc + (m.rating || 0), 0) / mentorsData.length).toFixed(1) : "0";

    return [
      { id: "total", label: "Total Mentors", value: mentorsData.length },
      { id: "available", label: "Available Now", value: availableMentors },
      { id: "sessions", label: "Total Sessions", value: totalSessions },
      { id: "avgRating", label: "Avg Rating", value: avgRating },
    ];
  }, [mentorsData]);

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
    <DataViewPage<Mentor>
      config={mentorshipPageConfig}
      data={mentorsData}
      stats={stats}
      getRowId={(m) => m.id}
      searchFields={["name", "title", "expertise", "bio"]}
      onAction={handleAction}
    />
  );
}
