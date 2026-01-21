"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { caseStudiesPageConfig } from "@/config/pages/case-studies";

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  results: string[];
  published_at: string;
  views: number;
  downloads: number;
  featured: boolean;
}

export default function CaseStudiesPage() {
  const [caseStudiesData, setCaseStudiesData] = React.useState<CaseStudy[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCaseStudies() {
      try {
        const response = await fetch("/api/v1/case-studies");
        if (response.ok) {
          const result = await response.json();
          setCaseStudiesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch case studies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCaseStudies();
  }, []);

  const stats = React.useMemo(() => {
    const featuredCount = caseStudiesData.filter((c) => c.featured).length;
    const totalViews = caseStudiesData.reduce((acc, c) => acc + (c.views || 0), 0);
    const totalDownloads = caseStudiesData.reduce((acc, c) => acc + (c.downloads || 0), 0);

    return [
      { id: "total", label: "Total", value: caseStudiesData.length },
      { id: "featured", label: "Featured", value: featuredCount },
      { id: "views", label: "Total Views", value: totalViews.toLocaleString() },
      { id: "downloads", label: "Downloads", value: totalDownloads },
    ];
  }, [caseStudiesData]);

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
    <DataViewPage<CaseStudy>
      config={caseStudiesPageConfig}
      data={caseStudiesData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["title", "client", "industry"]}
      onAction={handleAction}
    />
  );
}
