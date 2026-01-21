"use client";

import * as React from "react";
import { DashboardPage as DashboardPageComponent } from "@/components/common";
import { dashboardPageConfig } from "@/config/pages/dashboard";

const recentActivity = [
  { id: 1, action: "Task completed", description: "Stage setup checklist - Summer Festival", user: "Sarah Chen", time: "5 min ago" },
  { id: 2, action: "Asset checked out", description: "LED Wall Panel x4 - Main Stage", user: "Mike Johnson", time: "12 min ago" },
  { id: 3, action: "Event phase changed", description: "Summer Festival moved to Pre-Production", user: "System", time: "1 hour ago" },
  { id: 4, action: "New crew call published", description: "Load-in Day 1 - 45 positions", user: "Alex Rivera", time: "2 hours ago" },
  { id: 5, action: "Invoice paid", description: "INV-2024-0156 - $12,500.00", user: "Finance", time: "3 hours ago" },
];

const upcomingTasks = [
  { id: 1, title: "Review vendor contracts", project: "Summer Festival", dueDate: "Today", priority: "high" },
  { id: 2, title: "Approve stage plot", project: "Corporate Gala", dueDate: "Today", priority: "medium" },
  { id: 3, title: "Submit budget revision", project: "Q4 Planning", dueDate: "Tomorrow", priority: "high" },
  { id: 4, title: "Confirm talent riders", project: "Summer Festival", dueDate: "Jan 22", priority: "medium" },
  { id: 5, title: "Schedule site survey", project: "New Venue Onboarding", dueDate: "Jan 23", priority: "low" },
];

const alerts = [
  { id: 1, message: "3 certifications expiring", severity: "warning" },
  { id: 2, message: "2 overdue timesheets", severity: "critical" },
  { id: 3, message: "5 pending approvals", severity: "info" },
];

export default function DashboardPage() {
  const data = React.useMemo(() => ({
    recentActivity,
    upcomingTasks,
    alerts,
  }), []);

  const stats = React.useMemo(() => ({
    activeTasks: { value: 127 },
    upcomingEvents: { value: 8 },
    teamMembers: { value: 48 },
    assetsCheckedOut: { value: 156 },
  }), []);

  const handleAction = React.useCallback((actionId: string) => {
    console.log("Dashboard action:", actionId);
  }, []);

  return (
    <DashboardPageComponent
      config={dashboardPageConfig}
      data={data}
      stats={stats}
      onAction={handleAction}
    />
  );
}
