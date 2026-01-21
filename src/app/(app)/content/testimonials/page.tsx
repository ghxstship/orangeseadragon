"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { testimonialsPageConfig } from "@/config/pages/testimonials";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  featured: boolean;
  approved: boolean;
  date: string;
}

export default function TestimonialsPage() {
  const [testimonialsData, setTestimonialsData] = React.useState<Testimonial[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch("/api/v1/testimonials");
        if (response.ok) {
          const result = await response.json();
          setTestimonialsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTestimonials();
  }, []);

  const stats = React.useMemo(() => {
    const featuredCount = testimonialsData.filter((t) => t.featured).length;
    const approvedCount = testimonialsData.filter((t) => t.approved).length;
    const avgRating = testimonialsData.length > 0
      ? (testimonialsData.reduce((acc, t) => acc + (t.rating || 0), 0) / testimonialsData.length).toFixed(1)
      : "0.0";

    return [
      { id: "total", label: "Total", value: testimonialsData.length },
      { id: "featured", label: "Featured", value: featuredCount },
      { id: "approved", label: "Approved", value: approvedCount },
      { id: "avgRating", label: "Avg Rating", value: avgRating },
    ];
  }, [testimonialsData]);

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
    <DataViewPage<Testimonial>
      config={testimonialsPageConfig}
      data={testimonialsData}
      stats={stats}
      getRowId={(t) => t.id}
      searchFields={["quote", "author", "company"]}
      onAction={handleAction}
    />
  );
}
