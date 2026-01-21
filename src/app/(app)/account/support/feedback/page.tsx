"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { feedbackPageConfig } from "@/config/pages/feedback";

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  type: "bug" | "feature" | "improvement" | "question";
  status: "open" | "in_progress" | "resolved" | "closed";
  submitted_by: string;
  submitted_at: string;
  votes: number;
  comments: number;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = React.useState<FeedbackItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchFeedback() {
      try {
        const response = await fetch("/api/v1/feedback");
        if (response.ok) {
          const result = await response.json();
          setFeedback(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch feedback:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, []);

  const stats = React.useMemo(() => {
    const openCount = feedback.filter((f) => f.status === "open").length;
    const resolvedCount = feedback.filter((f) => f.status === "resolved").length;
    const totalVotes = feedback.reduce((acc, f) => acc + (f.votes || 0), 0);

    return [
      { id: "total", label: "Total Feedback", value: feedback.length },
      { id: "open", label: "Open", value: openCount },
      { id: "resolved", label: "Resolved", value: resolvedCount },
      { id: "votes", label: "Total Votes", value: totalVotes },
    ];
  }, [feedback]);

  const handleAction = React.useCallback((actionId: string, payload?: unknown) => {
    console.log("Action:", actionId, payload);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<FeedbackItem>
      config={feedbackPageConfig}
      data={feedback}
      stats={stats}
      getRowId={(f) => f.id}
      searchFields={["title", "description", "submitted_by"]}
      onAction={handleAction}
    />
  );
}
