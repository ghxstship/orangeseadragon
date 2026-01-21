"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  FileText,
  Copy,
  Star,
  Download,
  Calendar,
  Loader2,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  category: "contract" | "checklist" | "runsheet" | "budget" | "report" | "email" | "form";
  created_by: string;
  created_at: string;
  last_used?: string;
  usage_count: number;
  is_favorite: boolean;
  is_system: boolean;
}

const categoryConfig: Record<string, { label: string; color: string }> = {
  contract: { label: "Contract", color: "bg-blue-500" },
  checklist: { label: "Checklist", color: "bg-green-500" },
  runsheet: { label: "Runsheet", color: "bg-purple-500" },
  budget: { label: "Budget", color: "bg-orange-500" },
  report: { label: "Report", color: "bg-pink-500" },
  email: { label: "Email", color: "bg-yellow-500" },
  form: { label: "Form", color: "bg-gray-500" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TemplatesPage() {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch("/api/v1/templates");
        if (response.ok) {
          const result = await response.json();
          setTemplates(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const totalTemplates = templates.length;
  const favorites = templates.filter((t) => t.is_favorite).length;
  const systemTemplates = templates.filter((t) => t.is_system).length;
  const totalUsage = templates.reduce((acc, t) => acc + (t.usage_count || 0), 0);

  const stats = {
    totalTemplates,
    favorites,
    systemTemplates,
    totalUsage,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Reusable document and form templates
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500 flex items-center gap-2">
              <Star className="h-5 w-5 fill-current" />
              {stats.favorites}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.systemTemplates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Uses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-9" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const category = categoryConfig[template.category];

          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        {template.is_favorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${category.color} text-white`}>
                          {category.label}
                        </Badge>
                        {template.is_system && (
                          <Badge variant="outline">System</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Use Template
                      </DropdownMenuItem>
                      <DropdownMenuItem>Preview</DropdownMenuItem>
                      {!template.is_system && (
                        <DropdownMenuItem>Edit Template</DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>
                        {template.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
                      </DropdownMenuItem>
                      {!template.is_system && (
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 mb-4">
                  {template.description}
                </CardDescription>

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t">
                  <span>By {template.created_by}</span>
                  <span className="flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    {template.usage_count} uses
                  </span>
                </div>

                {template.last_used && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last used: {formatDate(template.last_used || '')}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
