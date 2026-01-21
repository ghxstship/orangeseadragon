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
import {
  Rocket,
  Clock,
  CheckCircle,
  Circle,
  Calendar,
} from "lucide-react";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  quarter: string;
  status: "completed" | "in_progress" | "planned" | "considering";
  progress?: number;
  features: string[];
}

const roadmapItems: RoadmapItem[] = [
  {
    id: "1",
    title: "Q1 2024 - Foundation",
    description: "Core platform improvements and stability",
    quarter: "Q1 2024",
    status: "completed",
    progress: 100,
    features: [
      "New authentication system",
      "Performance optimizations",
      "Mobile app v2.0",
      "API rate limiting",
    ],
  },
  {
    id: "2",
    title: "Q2 2024 - Collaboration",
    description: "Enhanced team collaboration features",
    quarter: "Q2 2024",
    status: "completed",
    progress: 100,
    features: [
      "Real-time collaboration",
      "Team chat integration",
      "Shared workspaces",
      "Activity feeds",
    ],
  },
  {
    id: "3",
    title: "Q3 2024 - Intelligence",
    description: "AI-powered features and automation",
    quarter: "Q3 2024",
    status: "in_progress",
    progress: 65,
    features: [
      "AI-powered insights",
      "Smart scheduling",
      "Predictive analytics",
      "Automated workflows",
    ],
  },
  {
    id: "4",
    title: "Q4 2024 - Scale",
    description: "Enterprise features and scalability",
    quarter: "Q4 2024",
    status: "planned",
    progress: 0,
    features: [
      "Multi-tenant architecture",
      "Advanced SSO options",
      "Custom integrations",
      "White-label support",
    ],
  },
  {
    id: "5",
    title: "2025 - Innovation",
    description: "Next-generation platform capabilities",
    quarter: "2025",
    status: "considering",
    progress: 0,
    features: [
      "AR/VR event experiences",
      "Blockchain ticketing",
      "Advanced AI assistants",
      "Global expansion",
    ],
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  in_progress: { label: "In Progress", color: "bg-blue-500", icon: Clock },
  planned: { label: "Planned", color: "bg-purple-500", icon: Calendar },
  considering: { label: "Considering", color: "bg-gray-500", icon: Circle },
};

export default function RoadmapPage() {
  const completedCount = roadmapItems.filter((i) => i.status === "completed").length;
  const inProgressCount = roadmapItems.filter((i) => i.status === "in_progress").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Roadmap</h1>
          <p className="text-muted-foreground">
            Upcoming features and platform direction
          </p>
        </div>
        <Rocket className="h-8 w-8 text-muted-foreground" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roadmapItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{completedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{inProgressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Q3 2024</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {roadmapItems.map((item) => {
          const status = statusConfig[item.status];
          const StatusIcon = status.icon;

          return (
            <Card key={item.id} className={item.status === "in_progress" ? "border-blue-500" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {item.title}
                      <Badge className={`${status.color} text-white`}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                  {item.progress !== undefined && item.progress > 0 && (
                    <div className="text-right w-24">
                      <p className="text-2xl font-bold">{item.progress}%</p>
                      <Progress value={item.progress} className="h-2 mt-1" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                  {item.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      {item.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : item.status === "in_progress" && idx < 2 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
