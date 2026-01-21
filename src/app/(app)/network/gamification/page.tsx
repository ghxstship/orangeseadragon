"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader, StatCard, StatGrid } from "@/components/common";
import {
  Trophy,
  Star,
  Target,
  Flame,
  Medal,
  Zap,
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  unlocked: boolean;
  unlockedAt?: string;
  points: number;
}

const achievements: Achievement[] = [
  {
    id: "1",
    name: "First Event",
    description: "Create your first event",
    icon: "🎉",
    progress: 1,
    total: 1,
    unlocked: true,
    unlockedAt: "2024-01-15",
    points: 100,
  },
  {
    id: "2",
    name: "Event Master",
    description: "Create 50 events",
    icon: "🏆",
    progress: 32,
    total: 50,
    unlocked: false,
    points: 500,
  },
  {
    id: "3",
    name: "Team Player",
    description: "Collaborate with 10 team members",
    icon: "👥",
    progress: 10,
    total: 10,
    unlocked: true,
    unlockedAt: "2024-03-20",
    points: 250,
  },
  {
    id: "4",
    name: "Streak Champion",
    description: "Log in for 30 consecutive days",
    icon: "🔥",
    progress: 15,
    total: 30,
    unlocked: false,
    points: 300,
  },
  {
    id: "5",
    name: "Automation Pro",
    description: "Create 10 automated workflows",
    icon: "⚡",
    progress: 7,
    total: 10,
    unlocked: false,
    points: 400,
  },
];

const leaderboard = [
  { rank: 1, name: "Sarah Chen", points: 12500, avatar: "S" },
  { rank: 2, name: "Mike Johnson", points: 10200, avatar: "M" },
  { rank: 3, name: "Emily Watson", points: 9800, avatar: "E" },
  { rank: 4, name: "You", points: 8500, avatar: "Y", isCurrentUser: true },
  { rank: 5, name: "David Park", points: 7200, avatar: "D" },
];

export default function GamificationPage() {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements.filter((a) => a.unlocked).reduce((acc, a) => acc + a.points, 0);
  const currentStreak = 15;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gamification"
        description="Achievements, badges, and leaderboards"
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Points"
          value={totalPoints.toLocaleString()}
          icon={Zap}
        />
        <StatCard
          title="Achievements"
          value={`${unlockedCount}/${achievements.length}`}
          icon={Trophy}
        />
        <StatCard
          title="Current Streak"
          value={`${currentStreak} days`}
          valueClassName="text-orange-500"
          icon={Flame}
        />
        <StatCard
          title="Leaderboard Rank"
          value="#4"
          valueClassName="text-blue-500"
          icon={Medal}
        />
      </StatGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription>Unlock achievements to earn points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`p-4 border rounded-lg ${achievement.unlocked ? "bg-green-50 dark:bg-green-950/20 border-green-500" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{achievement.name}</h4>
                        {achievement.unlocked && (
                          <Badge className="bg-green-500 text-white">
                            <Star className="mr-1 h-3 w-3" />
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {!achievement.unlocked && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{achievement.progress}/{achievement.total}</span>
                            <span>{Math.round((achievement.progress / achievement.total) * 100)}%</span>
                          </div>
                          <Progress value={(achievement.progress / achievement.total) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{achievement.points}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Leaderboard
            </CardTitle>
            <CardDescription>Top performers this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div key={user.rank} className={`flex items-center justify-between p-3 border rounded-lg ${user.isCurrentUser ? "bg-primary/5 border-primary" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${user.rank === 1 ? "bg-yellow-500 text-white" : user.rank === 2 ? "bg-gray-400 text-white" : user.rank === 3 ? "bg-orange-700 text-white" : "bg-muted"}`}>
                      {user.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">{user.avatar}</span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {user.isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{user.points.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
