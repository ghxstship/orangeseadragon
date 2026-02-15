"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, Bell, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface InboxSummaryData {
  unreadCount: number;
  pendingApprovals: number;
  mentions: number;
  alerts: number;
}

export function InboxSummaryWidget() {
  const [data, setData] = useState<InboxSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInboxSummary() {
      try {
        const response = await fetch("/api/inbox?limit=100");
        const result = await response.json();

        if (result.data) {
          const items = result.data;
          setData({
            unreadCount: items.filter((i: { read: boolean }) => !i.read).length,
            pendingApprovals: items.filter((i: { type: string; read: boolean }) => i.type === "approval" && !i.read).length,
            mentions: items.filter((i: { type: string }) => i.type === "mention").length,
            alerts: items.filter((i: { type: string }) => i.type === "alert").length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch inbox summary:", error);
        setData({ unreadCount: 0, pendingApprovals: 0, mentions: 0, alerts: 0 });
      } finally {
        setIsLoading(false);
      }
    }
    fetchInboxSummary();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="spatial-card bg-card/50 backdrop-blur-xl border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-50">
            Inbox
          </CardTitle>
          {data && data.unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {data.unreadCount} unread
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <CheckCircle className="h-4 w-4 text-semantic-warning" />
            <div>
              <div className="text-lg font-bold">{data?.pendingApprovals || 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Approvals</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Bell className="h-4 w-4 text-semantic-info" />
            <div>
              <div className="text-lg font-bold">{data?.mentions || 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Mentions</div>
            </div>
          </div>
        </div>

        {data && data.alerts > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{data.alerts} alerts need attention</span>
          </div>
        )}

        <Link href="/core/inbox">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Inbox className="h-4 w-4" />
            View Inbox
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
