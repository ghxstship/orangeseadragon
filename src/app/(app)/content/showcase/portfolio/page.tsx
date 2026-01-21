"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, ExternalLink, Loader2 } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  year: string;
  featured: boolean;
}

export default function ShowcasePortfolioPage() {
  const [portfolioItems, setPortfolioItems] = React.useState<PortfolioItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchPortfolio() {
      try {
        const response = await fetch("/api/v1/content/showcase/portfolio");
        if (response.ok) {
          const result = await response.json();
          setPortfolioItems(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
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
      <div><h1 className="text-3xl font-bold tracking-tight">Portfolio</h1><p className="text-muted-foreground">Our work</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {portfolioItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <div className="aspect-square bg-muted flex items-center justify-center"><Image className="h-12 w-12 text-muted-foreground" /></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between"><CardTitle className="text-lg">{item.title}</CardTitle>{item.featured && <Badge>Featured</Badge>}</div>
              <CardDescription>{item.category} • {item.year}</CardDescription>
            </CardHeader>
            <CardContent><Button variant="outline" size="sm" className="w-full"><ExternalLink className="h-3 w-3 mr-2" />View Project</Button></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
