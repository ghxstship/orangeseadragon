"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { challengesPageConfig } from "@/config/pages/challenges";

interface Challenge {
  id: string;
  title: string;
  description: string;
  status: "active" | "upcoming" | "completed";
  category: string;
  participants: number;
  prize: string;
  start_date: string;
  end_date: string;
  days_remaining?: number;
}

export default function ChallengesPage() {
  const [challengesData, setChallengesData] = React.useState<Challenge[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchChallenges() {
      try {
        const response = await fetch("/api/v1/network/challenges");
        if (response.ok) {
          const result = await response.json();
          setChallengesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchChallenges();
  }, []);

  const stats = React.useMemo(() => {
    const active = challengesData.filter((c) => c.status === "active").length;
    const totalParticipants = challengesData.reduce((acc, c) => acc + (c.participants || 0), 0);

    return [
      { id: "total", label: "Total Challenges", value: challengesData.length },
      { id: "active", label: "Active", value: active },
      { id: "participants", label: "Total Participants", value: totalParticipants },
      { id: "entries", label: "Your Entries", value: 2 },
    ];
  }, [challengesData]);

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
    <DataViewPage<Challenge>
      config={challengesPageConfig}
      data={challengesData}
      stats={stats}
      getRowId={(c) => c.id}
      searchFields={["title", "description", "category"]}
      onAction={handleAction}
    />
  );
}
