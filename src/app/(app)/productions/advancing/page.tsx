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

const statusConfig: Record<string, { color: string; text: string }> = {
  complete: { color: 'bg-primary', text: 'Ready' },
  'in-progress': { color: 'bg-primary/60', text: 'In Progress' },
  pending: { color: 'bg-muted-foreground', text: 'Pending' },
  attention: { color: 'bg-destructive', text: 'Action Required' },
};

export default function AdvancingPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Advancing & Logistics</h1>
            <p className="text-muted-foreground">Pre-production readiness tracker</p>
          </div>
          <Badge variant="secondary" className="h-8 px-3">
            Overall Readiness: 65%
          </Badge>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const progress = (category.completed / category.total) * 100;
            const { color, text } = statusConfig[category.status];

            return (
              <Link key={category.id} href={category.href}>
                <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <div className="p-2 rounded-md bg-muted border text-muted-foreground">
                        {category.icon}
                      </div>
                      {category.title}
                    </CardTitle>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={color.replace('bg-', 'text-')}>{text}</span>
                        <span className="text-muted-foreground">{category.completed}/{category.total}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
