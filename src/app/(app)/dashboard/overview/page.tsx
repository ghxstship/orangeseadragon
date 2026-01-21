"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const stats = [
  { label: "Active Events", value: "24", change: "+12%", icon: Calendar, color: "text-blue-500" },
  { label: "Team Members", value: "156", change: "+8%", icon: Users, color: "text-green-500" },
  { label: "Revenue MTD", value: "$284K", change: "+23%", icon: DollarSign, color: "text-yellow-500" },
  { label: "Tasks Completed", value: "89%", change: "+5%", icon: TrendingUp, color: "text-purple-500" },
];

const recentActivity = [
  { id: 1, action: "Event created", item: "Summer Festival 2024", time: "2 hours ago", icon: Calendar },
  { id: 2, action: "Task completed", item: "Vendor contracts review", time: "4 hours ago", icon: CheckCircle },
  { id: 3, action: "Team member added", item: "Sarah Chen joined", time: "Yesterday", icon: Users },
  { id: 4, action: "Invoice paid", item: "INV-2024-0156", time: "Yesterday", icon: DollarSign },
];

const upcomingDeadlines = [
  { id: 1, title: "Submit venue deposit", date: "Tomorrow", priority: "high" },
  { id: 2, title: "Finalize catering menu", date: "In 3 days", priority: "medium" },
  { id: 3, title: "Review marketing materials", date: "In 5 days", priority: "low" },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Your dashboard at a glance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-500">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.item}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Tasks requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${deadline.priority === "high" ? "bg-red-100 dark:bg-red-900" : deadline.priority === "medium" ? "bg-yellow-100 dark:bg-yellow-900" : "bg-green-100 dark:bg-green-900"}`}>
                    {deadline.priority === "high" ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{deadline.title}</p>
                    <p className="text-xs text-muted-foreground">{deadline.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
          <CardDescription>Track your goals for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Events Completed</span>
                <span>8/10</span>
              </div>
              <Progress value={80} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Revenue Target</span>
                <span>$284K/$350K</span>
              </div>
              <Progress value={81} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Client Satisfaction</span>
                <span>4.8/5.0</span>
              </div>
              <Progress value={96} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
