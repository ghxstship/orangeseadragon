"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { achievementsPageConfig } from "@/config/pages/achievements";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  progress: number;
  total: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAchievements() {
      try {
        const response = await fetch("/api/v1/achievements");
        if (response.ok) {
          const result = await response.json();
          setAchievements(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  const stats = React.useMemo(() => {
    const unlockedCount = achievements.filter((a) => a.unlocked).length;
    const categories = new Set(achievements.map((a) => a.category)).size;
    const completionPercent = achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;

    return [
      { id: "total", label: "Total Achievements", value: achievements.length },
      { id: "unlocked", label: "Unlocked", value: unlockedCount },
      { id: "completion", label: "Completion", value: `${completionPercent}%` },
      { id: "categories", label: "Categories", value: categories },
    ];
  }, [achievements]);

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
    <DataViewPage<Achievement>
      config={achievementsPageConfig}
      data={achievements}
      stats={stats}
      getRowId={(a) => a.id}
      searchFields={["name", "description", "category"]}
      onAction={handleAction}
    />
  );
}
