"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { jobsPageConfig } from "@/config/pages/jobs";

interface Job {
  id: string;
  title: string;
  client: string;
  location: string;
  date: string;
  status: "upcoming" | "in_progress" | "completed" | "cancelled";
  crew_needed: number;
  crew_assigned: number;
  rate: number;
  type: string;
}

export default function JobsPage() {
  const [jobsData, setJobsData] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/v1/jobs");
        if (response.ok) {
          const result = await response.json();
          setJobsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const stats = React.useMemo(() => {
    const upcomingJobs = jobsData.filter((j) => j.status === "upcoming").length;
    const activeJobs = jobsData.filter((j) => j.status !== "completed" && j.status !== "cancelled");
    const totalCrewNeeded = activeJobs.reduce((acc, j) => acc + (j.crew_needed || 0), 0);
    const totalCrewAssigned = activeJobs.reduce((acc, j) => acc + (j.crew_assigned || 0), 0);

    return [
      { id: "total", label: "Total Jobs", value: jobsData.length },
      { id: "upcoming", label: "Upcoming", value: upcomingJobs },
      { id: "crew", label: "Crew Needed", value: `${totalCrewAssigned}/${totalCrewNeeded}` },
      { id: "thisWeek", label: "This Week", value: activeJobs.length },
    ];
  }, [jobsData]);

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
    <DataViewPage<Job>
      config={jobsPageConfig}
      data={jobsData}
      stats={stats}
      getRowId={(j) => j.id}
      searchFields={["title", "client", "location", "type"]}
      onAction={handleAction}
    />
  );
}
