"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Loader2 } from "lucide-react";

interface ChallengeEntry {
  id: string;
  challenge: string;
  status: string;
  progress: number;
  joined_at: string;
}

export default function ChallengesMyEntriesPage() {
  const [myEntries, setMyEntries] = React.useState<ChallengeEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchMyEntries() {
      try {
        const response = await fetch("/api/v1/network/challenges/my-entries");
        if (response.ok) {
          const result = await response.json();
          setMyEntries(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch my entries:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyEntries();
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
      <div><h1 className="text-3xl font-bold tracking-tight">My Entries</h1><p className="text-muted-foreground">Your challenge participation</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5" />My Challenges</CardTitle><CardDescription>Challenges you have joined</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myEntries.map((entry) => (
              <div key={entry.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between"><h4 className="font-medium">{entry.challenge}</h4><Badge variant={entry.status === "completed" ? "default" : "secondary"}>{entry.status.replace("_", " ")}</Badge></div>
                <div className="mt-2"><div className="flex justify-between text-sm mb-1"><span>Progress</span><span>{entry.progress}%</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${entry.progress}%` }} /></div></div>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1"><Calendar className="h-3 w-3" />Joined: {entry.joined_at}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
