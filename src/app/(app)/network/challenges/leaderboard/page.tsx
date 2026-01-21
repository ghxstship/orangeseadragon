"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Loader2 } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  badges: number;
}

export default function ChallengesLeaderboardPage() {
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/v1/network/challenges/leaderboard");
        if (response.ok) {
          const result = await response.json();
          setLeaderboard(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1><p className="text-muted-foreground">Top performers</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />Rankings</CardTitle><CardDescription>Current standings</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <div key={entry.rank} className={`flex items-center justify-between p-4 border rounded-lg ${entry.rank <= 3 ? "bg-muted/50" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${entry.rank === 1 ? "bg-yellow-500 text-white" : entry.rank === 2 ? "bg-gray-400 text-white" : entry.rank === 3 ? "bg-orange-500 text-white" : "bg-muted"}`}>{entry.rank}</div>
                  <div><h4 className="font-medium">{entry.name}</h4><p className="text-sm text-muted-foreground flex items-center gap-1"><Medal className="h-3 w-3" />{entry.badges} badges</p></div>
                </div>
                <span className="text-xl font-bold">{entry.points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
