"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Loader2 } from "lucide-react";

interface PastChallenge {
  id: string;
  name: string;
  result: string;
  points: number;
  ended_at: string;
}

export default function ChallengesPastPage() {
  const [pastChallenges, setPastChallenges] = React.useState<PastChallenge[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPastChallenges() {
      try {
        const response = await fetch("/api/v1/network/challenges/past");
        if (response.ok) {
          const result = await response.json();
          setPastChallenges(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch past challenges:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPastChallenges();
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
      <div><h1 className="text-3xl font-bold tracking-tight">Past Challenges</h1><p className="text-muted-foreground">Completed challenges</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />Challenge History</CardTitle><CardDescription>Previous challenges</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pastChallenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2"><h4 className="font-medium">{challenge.name}</h4><Badge variant={challenge.result === "completed" ? "default" : "secondary"}>{challenge.result}</Badge></div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><Calendar className="h-3 w-3" />Ended: {challenge.ended_at}</p>
                </div>
                <span className="font-bold text-lg">+{challenge.points} pts</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
