'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * REPORT TEMPLATE LIBRARY — Browse & Launch 50+ Pre-Built Reports (G2)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BarChart3, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { reportTemplates, getReportsByCategory } from '@/lib/reports/report-templates';
import type { ReportCategory, ReportTemplateDefinition } from '@/lib/reports/types';

const CATEGORIES: { value: ReportCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Reports' },
  { value: 'financial', label: 'Financial' },
  { value: 'utilization', label: 'Utilization' },
  { value: 'sales', label: 'Sales' },
  { value: 'project', label: 'Project' },
  { value: 'people', label: 'People' },
  { value: 'operations', label: 'Operations' },
];

interface ReportTemplateLibraryProps {
  onSelectTemplate: (template: ReportTemplateDefinition) => void;
  className?: string;
}

export function ReportTemplateLibrary({ onSelectTemplate, className }: ReportTemplateLibraryProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ReportCategory | 'all'>('all');

  const filtered = useMemo(() => {
    let results = category === 'all' ? reportTemplates : getReportsByCategory(category);
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.includes(q))
      );
    }
    return results;
  }, [category, search]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="pl-9"
          />
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto">
          {filtered.length} reports
        </Badge>
      </div>

      <Tabs value={category} onValueChange={(v) => setCategory(v as ReportCategory | 'all')}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-3 py-1 text-xs"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:border-primary/50 transition-colors group"
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[9px]">
                  {template.chartType}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template);
                  }}
                >
                  <Play className="h-3.5 w-3.5" />
                </Button>
              </div>
              <CardTitle className="text-sm font-semibold">{template.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                {template.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[9px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <BarChart3 className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm font-medium">No reports found</p>
          <p className="text-xs">Try a different search term or category</p>
        </div>
      )}
    </div>
  );
}
