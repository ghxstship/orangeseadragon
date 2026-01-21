"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Trophy,
  Users,
  Target,
  Star,
  Clock,
  Award,
  Flame,
} from "lucide-react";

interface Challenge {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  endDate: string;
  participants: number;
  reward: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

const challenges: Challenge[] = [
  {
    id: "1",
    name: "Event Excellence",
    description: "Complete 10 events with 4.5+ rating",
    progress: 7,
    target: 10,
    endDate: "Jul 31, 2024",
    participants: 45,
    reward: "500 points + Gold Badge",
    difficulty: "hard",
    category: "Events",
  },
  {
    id: "2",
    name: "Team Player",
    description: "Collaborate on 5 team projects",
    progress: 3,
    target: 5,
    endDate: "Jun 30, 2024",
    participants: 32,
    reward: "250 points + Silver Badge",
    difficulty: "medium",
    category: "Collaboration",
  },
  {
    id: "3",
    name: "First Steps",
    description: "Complete your profile and first event",
    progress: 1,
    target: 2,
    endDate: "Jun 20, 2024",
    participants: 128,
    reward: "100 points + Bronze Badge",
    difficulty: "easy",
    category: "Getting Started",
  },
  {
    id: "4",
    name: "Networking Pro",
    description: "Connect with 20 industry professionals",
    progress: 12,
    target: 20,
    endDate: "Aug 15, 2024",
    participants: 67,
    reward: "300 points + Networking Badge",
    difficulty: "medium",
    category: "Networking",
  },
];

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: "Easy", color: "bg-green-500" },
  medium: { label: "Medium", color: "bg-yellow-500" },
  hard: { label: "Hard", color: "bg-red-500" },
};

export default function ChallengesActivePage() {
  const totalParticipants = challenges.reduce((acc, c) => acc + c.participants, 0);
  const avgProgress = Math.round(
    challenges.reduce((acc, c) => acc + (c.progress / c.target) * 100, 0) / challenges.length
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Challenges"
        description="Ongoing challenges you can participate in"
        actions={
          <Button>
            <Trophy className="h-4 w-4 mr-2" />
            View Leaderboard
          </Button>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Active Challenges"
          value={challenges.length}
          icon={Target}
        />
        <StatCard
          title="Your Progress"
          value={`${avgProgress}%`}
          valueClassName="text-blue-500"
          icon={Flame}
        />
        <StatCard
          title="Total Participants"
          value={totalParticipants}
          icon={Users}
        />
        <StatCard
          title="Rewards Available"
          value="1,150 pts"
          valueClassName="text-yellow-500"
          icon={Award}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Active Challenges
          </CardTitle>
          <CardDescription>Track your progress and earn rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {challenges.map((challenge) => {
              const difficulty = difficultyConfig[challenge.difficulty];
              const progressPercent = Math.round((challenge.progress / challenge.target) * 100);

              return (
                <div
                  key={challenge.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{challenge.name}</h4>
                          <Badge className={`${difficulty.color} text-white`}>
                            {difficulty.label}
                          </Badge>
                          <Badge variant="outline">{challenge.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {challenge.progress}/{challenge.target} ({progressPercent}%)
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Ends: {challenge.endDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {challenge.participants} participants
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{challenge.reward}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
