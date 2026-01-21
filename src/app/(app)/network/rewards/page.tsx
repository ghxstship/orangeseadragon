"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Gift,
  Star,
  Trophy,
  Zap,
  Crown,
} from "lucide-react";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  available: boolean;
}

const rewards: Reward[] = [
  {
    id: "1",
    name: "Free Month Subscription",
    description: "Get one month of Pro plan for free",
    pointsCost: 5000,
    category: "Subscription",
    available: true,
  },
  {
    id: "2",
    name: "Priority Support",
    description: "3 months of priority support access",
    pointsCost: 2500,
    category: "Support",
    available: true,
  },
  {
    id: "3",
    name: "Custom Branding",
    description: "Add your logo and colors to reports",
    pointsCost: 3500,
    category: "Features",
    available: true,
  },
  {
    id: "4",
    name: "API Rate Limit Boost",
    description: "Double your API rate limits for 1 month",
    pointsCost: 1500,
    category: "Technical",
    available: true,
  },
  {
    id: "5",
    name: "Exclusive Webinar Access",
    description: "Access to premium training webinars",
    pointsCost: 1000,
    category: "Learning",
    available: false,
  },
];

const tierConfig = [
  { name: "Bronze", minPoints: 0, icon: Star, color: "text-orange-700" },
  { name: "Silver", minPoints: 2500, icon: Star, color: "text-gray-400" },
  { name: "Gold", minPoints: 5000, icon: Crown, color: "text-yellow-500" },
  { name: "Platinum", minPoints: 10000, icon: Trophy, color: "text-purple-500" },
];

export default function RewardsPage() {
  const currentPoints = 3750;
  const currentTier = tierConfig.filter((t) => currentPoints >= t.minPoints).pop() || tierConfig[0];
  const nextTier = tierConfig.find((t) => t.minPoints > currentPoints);
  const progressToNext = nextTier ? ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 : 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rewards</h1>
          <p className="text-muted-foreground">
            Earn and redeem rewards
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{currentPoints.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <currentTier.icon className={`h-5 w-5 ${currentTier.color}`} />
              <span className="text-2xl font-bold">{currentTier.name}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rewards Redeemed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Points Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,500</div>
          </CardContent>
        </Card>
      </div>

      {nextTier && (
        <Card className="bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <currentTier.icon className={`h-5 w-5 ${currentTier.color}`} />
                <span className="font-medium">{currentTier.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <nextTier.icon className={`h-5 w-5 ${nextTier.color}`} />
                <span className="font-medium">{nextTier.name}</span>
              </div>
            </div>
            <Progress value={progressToNext} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {nextTier.minPoints - currentPoints} more points to reach {nextTier.name}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Available Rewards
          </CardTitle>
          <CardDescription>Redeem your points for rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => {
              const canRedeem = currentPoints >= reward.pointsCost && reward.available;

              return (
                <div key={reward.id} className={`p-4 border rounded-lg ${!reward.available ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{reward.name}</h4>
                        {!reward.available && (
                          <Badge variant="outline">Coming Soon</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                      <Badge variant="secondary" className="mt-2">{reward.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{reward.pointsCost.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">points</span>
                    </div>
                    <Button size="sm" disabled={!canRedeem}>
                      {canRedeem ? "Redeem" : currentPoints < reward.pointsCost ? "Not Enough Points" : "Unavailable"}
                    </Button>
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
