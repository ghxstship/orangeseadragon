'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  DollarSign,
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
  Star,
  Plus,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageShell } from '@/components/common/page-shell';

interface ReportCard {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ElementType;
  starred?: boolean;
  lastViewed?: string;
}

const reports: ReportCard[] = [
  { id: '1', name: 'Revenue by Client', description: 'Monthly revenue breakdown by client with trend analysis', category: 'Financial', icon: DollarSign, starred: true, lastViewed: '2 hours ago' },
  { id: '2', name: 'Project Profitability', description: 'Margin analysis per project with labor and expense breakdown', category: 'Financial', icon: TrendingUp, starred: true, lastViewed: '1 day ago' },
  { id: '3', name: 'Budget Variance', description: 'Estimated vs actual costs across all active budgets', category: 'Financial', icon: BarChart3, lastViewed: '3 days ago' },
  { id: '4', name: 'AR Aging', description: 'Outstanding invoices grouped by aging bucket', category: 'Financial', icon: Clock },
  { id: '5', name: 'Team Utilization', description: 'Billable vs non-billable hours per person per week', category: 'Utilization', icon: Users, starred: true, lastViewed: '5 hours ago' },
  { id: '6', name: 'Capacity Forecast', description: 'Projected availability vs demand for the next 8 weeks', category: 'Utilization', icon: Users },
  { id: '7', name: 'Pipeline Summary', description: 'Open deals by stage with weighted revenue forecast', category: 'Sales', icon: Briefcase, lastViewed: '1 day ago' },
  { id: '8', name: 'Win/Loss Analysis', description: 'Close rates by source, type, and salesperson', category: 'Sales', icon: TrendingUp },
  { id: '9', name: 'Project Status', description: 'All active projects with phase, health, and timeline', category: 'Project', icon: FileText, lastViewed: '6 hours ago' },
  { id: '10', name: 'Overdue Tasks', description: 'Tasks past due date grouped by project and assignee', category: 'Project', icon: Clock },
  { id: '11', name: 'Crew Performance', description: 'Gig ratings, reliability scores, and feedback summary', category: 'People', icon: Users },
  { id: '12', name: 'Certification Expiry', description: 'Upcoming certification expirations in the next 90 days', category: 'People', icon: Clock },
];

const categories = ['All', 'Financial', 'Utilization', 'Sales', 'Project', 'People'];

export default function ReportLibraryPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('All');

  const filtered = reports.filter((r) => {
    const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const starred = filtered.filter((r) => r.starred);
  const rest = filtered.filter((r) => !r.starred);

  return (
    <PageShell
      title="Report Library"
      description="Pre-built and custom reports"
      actions={
        <Button onClick={() => router.push('/analytics/reports/builder')}>
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      }
      underHeader={
        <div className="py-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-1">
            {categories.map((cat) => (
              <Button key={cat} variant={activeCategory === cat ? 'default' : 'ghost'} size="sm" onClick={() => setActiveCategory(cat)}>
                {cat}
              </Button>
            ))}
          </div>
        </div>
      }
      contentClassName="space-y-6"
    >
        {starred.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Starred</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {starred.map((report) => (
                <ReportCardComponent key={report.id} report={report} />
              ))}
            </div>
          </div>
        )}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">
            {activeCategory === 'All' ? 'All Reports' : activeCategory}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((report) => (
              <ReportCardComponent key={report.id} report={report} />
            ))}
          </div>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No reports found</p>
            <p className="text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}
    </PageShell>
  );
}

function ReportCardComponent({ report }: { report: ReportCard }) {
  const Icon = report.icon;
  return (
    <Card className="group cursor-pointer hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm">{report.name}</CardTitle>
          </div>
          {report.starred && <Star className="h-4 w-4 text-semantic-warning fill-current" />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{report.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-[10px]">{report.category}</Badge>
          {report.lastViewed && (
            <span className="text-[10px] text-muted-foreground">Viewed {report.lastViewed}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
