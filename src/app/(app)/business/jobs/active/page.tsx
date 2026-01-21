"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { jobsActivePageConfig } from "@/config/pages/jobs-active";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  applicants: number;
  posted_at: string;
}

export default function JobsActivePage() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch("/api/v1/business/jobs/active");
        if (response.ok) {
          const result = await response.json();
          setJobs(result.data || []);
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
    const totalApplicants = jobs.reduce((s, j) => s + (j.applicants || 0), 0);
    const avgApplicants = jobs.length > 0 ? Math.round(totalApplicants / jobs.length) : 0;
    return [
      { id: "total", label: "Open Positions", value: jobs.length },
      { id: "applicants", label: "Total Applicants", value: totalApplicants },
      { id: "avg", label: "Avg per Position", value: avgApplicants },
    ];
  }, [jobs]);

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
      config={jobsActivePageConfig}
      data={jobs}
      stats={stats}
      getRowId={(j) => j.id}
      searchFields={["title", "department", "location"]}
      onAction={handleAction}
    />
  );
}
