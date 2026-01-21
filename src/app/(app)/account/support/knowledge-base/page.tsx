"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { DataViewPage } from "@/components/common/data-view-page";
import { knowledgeBasePageConfig } from "@/config/pages/knowledge-base";
import { useRouter } from "next/navigation";

interface KnowledgeArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  views: number;
  helpful: number;
  type: "article" | "video" | "faq" | "tip";
  updated: string;
}

export default function AccountSupportKnowledgeBasePage() {
  const router = useRouter();
  const [articlesData, setArticlesData] = React.useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch("/api/v1/account/support/knowledge-base");
        if (response.ok) {
          const result = await response.json();
          setArticlesData(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch articles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const stats = React.useMemo(() => {
    const totalViews = articlesData.reduce((acc, a) => acc + (a.views || 0), 0);
    const totalHelpful = articlesData.reduce((acc, a) => acc + (a.helpful || 0), 0);
    const categories = new Set(articlesData.map((a) => a.category)).size;

    return [
      { id: "articles", label: "Total Articles", value: articlesData.length },
      { id: "views", label: "Total Views", value: totalViews },
      { id: "helpful", label: "Helpful Votes", value: totalHelpful },
      { id: "categories", label: "Categories", value: categories },
    ];
  }, [articlesData]);

  const handleAction = React.useCallback(
    (actionId: string, payload?: unknown) => {
      switch (actionId) {
        case "contact":
          router.push("/account/support/tickets/new");
          break;
        case "view":
          console.log("Read article", payload);
          break;
        case "helpful":
          console.log("Mark as helpful", payload);
          break;
        case "share":
          console.log("Share article", payload);
          break;
        default:
          console.log("Unknown action:", actionId, payload);
      }
    },
    [router]
  );

  const handleRowClick = React.useCallback(
    (article: KnowledgeArticle) => {
      router.push(`/account/support/knowledge-base/${article.id}`);
    },
    [router]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DataViewPage<KnowledgeArticle>
      config={knowledgeBasePageConfig}
      data={articlesData}
      stats={stats}
      getRowId={(article) => article.id}
      searchFields={["title", "excerpt", "category"]}
      onAction={handleAction}
      onRowClick={handleRowClick}
    />
  );
}
