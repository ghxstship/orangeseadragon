"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, MessageSquare, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  discussions: number;
  posts: number;
}

export default function DiscussionsCategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/v1/network/discussions/categories");
        if (response.ok) {
          const result = await response.json();
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Categories</h1><p className="text-muted-foreground">Browse by category</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <Card key={category.id} className="hover:border-primary transition-colors cursor-pointer">
            <CardHeader><CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5" />{category.name}</CardTitle><CardDescription>{category.description}</CardDescription></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground flex items-center gap-4"><span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{category.discussions} discussions</span><span>{category.posts} posts</span></p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
