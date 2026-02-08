'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Utensils, FileText, Users, Bed, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AdvancingCategory {
  id: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  status: 'complete' | 'in-progress' | 'pending' | 'attention';
  completed: number;
  total: number;
}

const categories: AdvancingCategory[] = [
  { id: 'riders', title: 'Tech Riders', href: '/productions/advancing/riders', icon: <FileText className="w-5 h-5" />, status: 'complete', completed: 4, total: 4 },
  { id: 'catering', title: 'Catering & Hospitality', href: '/productions/advancing/catering', icon: <Utensils className="w-5 h-5" />, status: 'in-progress', completed: 2, total: 5 },
  { id: 'guest-lists', title: 'Guest Lists', href: '/productions/advancing/guest-lists', icon: <Users className="w-5 h-5" />, status: 'pending', completed: 0, total: 150 },
  { id: 'hospitality', title: 'Travel & Hotels', href: '/productions/advancing/hospitality', icon: <Bed className="w-5 h-5" />, status: 'attention', completed: 1, total: 8 },
  { id: 'tech-specs', title: 'Stage Plots', href: '/productions/advancing/tech-specs', icon: <Wrench className="w-5 h-5" />, status: 'complete', completed: 1, total: 1 },
  { id: 'compliance', title: 'Safety & Permits', href: '/productions/advancing/compliance', icon: <ShieldCheck className="w-5 h-5" />, status: 'pending', completed: 0, total: 3 },
];

export default function AdvancingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advancing & Logistics</h1>
          <p className="text-muted-foreground">Pre-production readiness tracker</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 px-3 border-emerald-500/30 text-emerald-500 bg-emerald-500/10">
            Overall Readiness: 65%
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const progress = (category.completed / category.total) * 100;
          let statusColor = 'bg-status-pending';
          let statusText = 'Pending';

          if (category.status === 'complete') { statusColor = 'bg-status-completed'; statusText = 'Ready'; }
          if (category.status === 'in-progress') { statusColor = 'bg-status-on-track'; statusText = 'In Progress'; }
          if (category.status === 'attention') { statusColor = 'bg-status-at-risk'; statusText = 'Action Required'; }

          return (
            <Link key={category.id} href={category.href}>
              <Card className="h-full hover:bg-zinc-900/50 transition-colors cursor-pointer border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <div className="p-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {category.icon}
                    </div>
                    {category.title}
                  </CardTitle>
                  <ArrowRight className="w-4 h-4 text-zinc-600" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={statusColor.replace('bg-', 'text-')}>{statusText}</span>
                      <span className="text-zinc-500">{category.completed}/{category.total}</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className={`h-full ${statusColor}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
