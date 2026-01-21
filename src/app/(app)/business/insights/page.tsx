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
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Percent,
  Zap,
} from "lucide-react";

interface Insight {
  id: string;
  title: string;
  description: string;
  type: "trend" | "anomaly" | "prediction" | "recommendation";
  impact: "high" | "medium" | "low";
  confidence: number;
  metric?: string;
  change?: number;
}

const insights: Insight[] = [
  {
    id: "1",
    title: "Revenue Growth Trend",
    description: "Revenue has increased 15% compared to the same period last year, driven primarily by corporate events.",
    type: "trend",
    impact: "high",
    confidence: 92,
    metric: "Revenue",
    change: 15,
  },
  {
    id: "2",
    title: "Unusual Booking Pattern",
    description: "Booking cancellations have increased 25% in the last week. This may indicate a seasonal trend or external factor.",
    type: "anomaly",
    impact: "medium",
    confidence: 78,
    metric: "Cancellations",
    change: 25,
  },
  {
    id: "3",
    title: "Q4 Revenue Forecast",
    description: "Based on current trends, Q4 revenue is projected to exceed targets by 8%.",
    type: "prediction",
    impact: "high",
    confidence: 85,
    metric: "Q4 Revenue",
    change: 8,
  },
  {
    id: "4",
    title: "Optimize Staffing Levels",
    description: "Reducing weekend staffing by 10% could save $15,000/month without impacting service quality.",
    type: "recommendation",
    impact: "medium",
    confidence: 72,
  },
  {
    id: "5",
    title: "Customer Satisfaction Improving",
    description: "NPS score has improved from 42 to 58 over the last quarter.",
    type: "trend",
    impact: "high",
    confidence: 95,
    metric: "NPS",
    change: 38,
  },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  trend: { icon: TrendingUp, color: "bg-blue-500", label: "Trend" },
  anomaly: { icon: AlertTriangle, color: "bg-yellow-500", label: "Anomaly" },
  prediction: { icon: Sparkles, color: "bg-purple-500", label: "Prediction" },
  recommendation: { icon: Lightbulb, color: "bg-green-500", label: "Recommendation" },
};

const impactConfig: Record<string, { color: string }> = {
  high: { color: "bg-red-500" },
  medium: { color: "bg-yellow-500" },
  low: { color: "bg-gray-500" },
};

export default function InsightsPage() {
  const highImpact = insights.filter((i) => i.impact === "high").length;
  const avgConfidence = Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="AI-powered analytics and recommendations"
        actions={
          <Badge className="bg-purple-500 text-white">
            <Sparkles className="mr-1 h-3 w-3" />
            AI Powered
          </Badge>
        }
      />

      <StatGrid columns={4}>
        <StatCard
          title="Total Insights"
          value={insights.length}
          icon={Lightbulb}
        />
        <StatCard
          title="High Impact"
          value={highImpact}
          valueClassName="text-red-500"
          icon={Zap}
        />
        <StatCard
          title="Avg Confidence"
          value={`${avgConfidence}%`}
          icon={Percent}
        />
        <StatCard
          title="Actionable"
          value={insights.filter((i) => i.type === "recommendation").length}
          valueClassName="text-green-500"
          icon={Lightbulb}
        />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>Automatically generated insights from your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => {
              const type = typeConfig[insight.type];
              const impact = impactConfig[insight.impact];
              const TypeIcon = type.icon;

              return (
                <div key={insight.id} className={`p-4 border rounded-lg ${insight.impact === "high" ? "border-l-4 border-l-red-500" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <TypeIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge className={`${type.color} text-white`}>
                          {type.label}
                        </Badge>
                        <Badge className={`${impact.color} text-white`}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      
                      {insight.metric && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground">{insight.metric}:</span>
                          <span className={`flex items-center gap-1 font-medium ${insight.change && insight.change > 0 ? "text-green-500" : "text-red-500"}`}>
                            {insight.change && insight.change > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {insight.change && insight.change > 0 ? "+" : ""}{insight.change}%
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <Progress value={insight.confidence} className="h-1 w-24" />
                        <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
                      </div>
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
