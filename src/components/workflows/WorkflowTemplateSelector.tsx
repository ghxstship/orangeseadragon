"use client";

/**
 * Workflow Template Selector
 * UI component for browsing and selecting workflow templates
 */

import { useState, useMemo } from "react";
import { Search, Filter, ChevronRight, Zap, Mail, Users, DollarSign, Briefcase, Calendar, Headphones, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkflowTemplate } from "@/lib/workflow-engine/types";
import { allWorkflowTemplates } from "@/lib/workflow-engine/templates";

interface WorkflowTemplateSelectorProps {
  onSelect: (template: WorkflowTemplate) => void;
  selectedTemplateId?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  sales: <DollarSign className="h-4 w-4" />,
  crm: <Users className="h-4 w-4" />,
  marketing: <Mail className="h-4 w-4" />,
  finance: <DollarSign className="h-4 w-4" />,
  procurement: <Briefcase className="h-4 w-4" />,
  workforce: <Users className="h-4 w-4" />,
  hr: <Users className="h-4 w-4" />,
  project_management: <Calendar className="h-4 w-4" />,
  projects: <Calendar className="h-4 w-4" />,
  production: <Zap className="h-4 w-4" />,
  live_production: <Zap className="h-4 w-4" />,
  support: <Headphones className="h-4 w-4" />,
  compliance: <Shield className="h-4 w-4" />,
  assets: <Briefcase className="h-4 w-4" />,
  talent: <Users className="h-4 w-4" />,
  experience: <Calendar className="h-4 w-4" />,
};

const categoryLabels: Record<string, string> = {
  sales: "Sales",
  crm: "CRM",
  marketing: "Marketing",
  finance: "Finance",
  procurement: "Procurement",
  workforce: "Workforce",
  hr: "HR",
  project_management: "Projects",
  projects: "Projects",
  production: "Production",
  live_production: "Live Production",
  support: "Support",
  compliance: "Compliance",
  assets: "Assets",
  talent: "Talent",
  experience: "Experience",
};

export function WorkflowTemplateSelector({ onSelect, selectedTemplateId }: WorkflowTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(allWorkflowTemplates.map((t) => t.category));
    return Array.from(cats).sort();
  }, []);

  const filteredTemplates = useMemo(() => {
    let templates = allWorkflowTemplates;

    if (selectedCategory !== "all") {
      templates = templates.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return templates;
  }, [selectedCategory, searchQuery]);

  const templatesByCategory = useMemo(() => {
    const grouped: Record<string, WorkflowTemplate[]> = {};
    for (const template of filteredTemplates) {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    }
    return grouped;
  }, [filteredTemplates]);

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter Header */}
      <div className="p-4 border-b space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="all" className="text-xs">
              All ({allWorkflowTemplates.length})
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="text-xs gap-1">
                {categoryIcons[category]}
                {categoryLabels[category] || category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Template List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {Object.entries(templatesByCategory).map(([category, templates]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {categoryIcons[category]}
                <span>{categoryLabels[category] || category}</span>
                <Badge variant="secondary" className="ml-auto">
                  {templates.length}
                </Badge>
              </div>

              <div className="grid gap-2">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedTemplateId === template.id ? "border-primary bg-accent" : ""
                    }`}
                    onClick={() => onSelect(template)}
                  >
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                          <CardDescription className="text-xs line-clamp-2">
                            {template.description}
                          </CardDescription>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No templates found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">
          {filteredTemplates.length} of {allWorkflowTemplates.length} templates
        </p>
      </div>
    </div>
  );
}
