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
import { Input } from "@/components/ui/input";
import {
  Search,
  Share2,
  Gift,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Referral {
  id: string;
  referredName: string;
  referredEmail: string;
  referredBy: string;
  status: "pending" | "signed_up" | "converted" | "rewarded";
  reward: number;
  createdAt: string;
  convertedAt?: string;
}

const referrals: Referral[] = [
  {
    id: "1",
    referredName: "John Smith",
    referredEmail: "john@example.com",
    referredBy: "Sarah Chen",
    status: "rewarded",
    reward: 50,
    createdAt: "2024-05-15",
    convertedAt: "2024-05-20",
  },
  {
    id: "2",
    referredName: "Jane Doe",
    referredEmail: "jane@example.com",
    referredBy: "Mike Johnson",
    status: "converted",
    reward: 50,
    createdAt: "2024-06-01",
    convertedAt: "2024-06-10",
  },
  {
    id: "3",
    referredName: "Bob Wilson",
    referredEmail: "bob@example.com",
    referredBy: "Emily Watson",
    status: "signed_up",
    reward: 50,
    createdAt: "2024-06-12",
  },
  {
    id: "4",
    referredName: "Alice Brown",
    referredEmail: "alice@example.com",
    referredBy: "Sarah Chen",
    status: "pending",
    reward: 50,
    createdAt: "2024-06-14",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-gray-500", icon: Clock },
  signed_up: { label: "Signed Up", color: "bg-blue-500", icon: Users },
  converted: { label: "Converted", color: "bg-green-500", icon: CheckCircle },
  rewarded: { label: "Rewarded", color: "bg-yellow-500", icon: Gift },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ReferralsPage() {
  const convertedCount = referrals.filter((r) => r.status === "converted" || r.status === "rewarded").length;
  const pendingCount = referrals.filter((r) => r.status === "pending").length;
  const totalRewards = referrals.filter((r) => r.status === "rewarded").reduce((acc, r) => acc + r.reward, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
          <p className="text-muted-foreground">
            Track and manage referrals
          </p>
        </div>
        <Button>
          <Share2 className="mr-2 h-4 w-4" />
          Share Referral Link
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{convertedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRewards}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Your Referral Link</h3>
              <p className="text-sm text-muted-foreground">Share this link to earn $50 for each successful referral</p>
            </div>
            <div className="flex items-center gap-2">
              <Input value="https://app.example.com/ref/abc123" readOnly className="w-80" />
              <Button variant="outline">Copy</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search referrals..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Referrals
          </CardTitle>
          <CardDescription>Track your referral progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals.map((referral) => {
              const status = statusConfig[referral.status];
              const StatusIcon = status.icon;

              return (
                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">{referral.referredName[0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{referral.referredName}</h4>
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{referral.referredEmail}</p>
                      <p className="text-xs text-muted-foreground">Referred by {referral.referredBy} on {formatDate(referral.createdAt)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">${referral.reward}</p>
                    <p className="text-xs text-muted-foreground">
                      {referral.status === "rewarded" ? "Earned" : "Potential"}
                    </p>
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
