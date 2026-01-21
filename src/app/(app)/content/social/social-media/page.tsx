"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { socialMediaPageConfig } from "@/config/pages/social-media";
import { SOCIAL_POST_STATUS, type SocialPostStatus } from "@/lib/enums";

interface SocialPost {
  id: string;
  content: string;
  platforms: ("instagram" | "twitter" | "facebook" | "linkedin" | "tiktok")[];
  event_name: string;
  scheduled_date: string;
  scheduled_time: string;
  status: SocialPostStatus;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
  };
  media_type: "image" | "video" | "carousel" | "text";
  created_by: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function SocialMediaPage() {
  const [socialPostsData, setSocialPostsData] = React.useState<SocialPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSocialPosts() {
      try {
        const response = await fetch("/api/v1/content/social/social-media");
        if (response.ok) {
          const result = await response.json();
          setSocialPostsData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch social posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSocialPosts();
  }, []);

  const stats = React.useMemo(() => {
    const published = socialPostsData.filter((p) => p.status === SOCIAL_POST_STATUS.PUBLISHED).length;
    const scheduled = socialPostsData.filter((p) => p.status === SOCIAL_POST_STATUS.SCHEDULED).length;
    const totalEngagement = socialPostsData.reduce((acc, p) => {
      const eng = p.engagement || { likes: 0, comments: 0, shares: 0 };
      return acc + (eng.likes || 0) + (eng.comments || 0) + (eng.shares || 0);
    }, 0);
    return [
      { id: "total", label: "Total Posts", value: socialPostsData.length },
      { id: "published", label: "Published", value: published },
      { id: "scheduled", label: "Scheduled", value: scheduled },
      { id: "engagement", label: "Total Engagement", value: formatNumber(totalEngagement) },
    ];
  }, [socialPostsData]);

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
    <DataViewPage<SocialPost>
      config={socialMediaPageConfig}
      data={socialPostsData}
      stats={stats}
      getRowId={(p) => p.id}
      searchFields={["content", "event_name"]}
      onAction={handleAction}
    />
  );
}
