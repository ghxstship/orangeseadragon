"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Loader2 } from "lucide-react";

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  industry: string;
  results: string;
}

export default function ShowcaseCaseStudiesPage() {
  const [caseStudies, setCaseStudies] = React.useState<CaseStudy[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCaseStudies() {
      try {
        const response = await fetch("/api/v1/content/showcase/case-studies");
        if (response.ok) {
          const result = await response.json();
          setCaseStudies(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch case studies:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCaseStudies();
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
      <div><h1 className="text-3xl font-bold tracking-tight">Case Studies</h1><p className="text-muted-foreground">Success stories and results</p></div>
      <div className="grid gap-6 md:grid-cols-3">
        {caseStudies.map((study) => (
          <Card key={study.id}>
            <CardHeader>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-2"><FileText className="h-12 w-12 text-muted-foreground" /></div>
              <CardTitle>{study.title}</CardTitle>
              <CardDescription>{study.client}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="mb-2">{study.industry}</Badge>
              <p className="text-sm text-muted-foreground">{study.results}</p>
              <Button variant="link" className="px-0 mt-2">Read More<ArrowRight className="h-3 w-3 ml-1" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
