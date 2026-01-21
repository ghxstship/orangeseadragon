"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { pressPageConfig } from "@/config/pages/press";

interface PressItem {
  id: string;
  title: string;
  publication: string;
  type: "article" | "press_release" | "interview" | "mention";
  summary: string;
  url: string;
  published_at: string;
  featured: boolean;
}

export default function PressPage() {
  const [pressData, setPressData] = React.useState<PressItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPress() {
      try {
        const response = await fetch("/api/v1/press");
        if (response.ok) {
          const result = await response.json();
          setPressData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch press:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPress();
  }, []);

  const stats = React.useMemo(() => {
    const featuredCount = pressData.filter((p) => p.featured).length;
    const articles = pressData.filter((p) => p.type === "article").length;

    return [
      { id: "total", label: "Total Coverage", value: pressData.length },
      { id: "featured", label: "Featured", value: featuredCount },
      { id: "articles", label: "Articles", value: articles },
      { id: "thisYear", label: "This Year", value: pressData.length },
    ];
  }, [pressData]);

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
    <DataViewPage<PressItem>
      config={pressPageConfig}
      data={pressData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["title", "publication", "summary"]}
      onAction={handleAction}
    />
  );
}
