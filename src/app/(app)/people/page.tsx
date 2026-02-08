'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import {
  Users,
  UserCheck,
  Briefcase,
  UserPlus,
  User,
  CalendarDays,
  Clock,
  Building2,
  ShieldCheck,
  Palmtree,
  FileText,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

interface NavCardProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}

function NavCard({ href, icon: Icon, title, description }: NavCardProps) {
  return (
    <Link href={href}>
      <Card className="group cursor-pointer hover:bg-accent/50 transition-all border-border h-full">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-40 transition-opacity shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function PeoplePage() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header — Layout C */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">People</h1>
            <p className="text-muted-foreground">Human resources management</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* KPI Stats */}
        <StatGrid columns={4}>
          <StatCard title="Total Staff" value="245" icon={Users} />
          <StatCard title="Available Now" value="89" icon={UserCheck} />
          <StatCard title="On Assignment" value="156" icon={Briefcase} />
          <StatCard title="Pending Onboard" value="12" icon={UserPlus} />
        </StatGrid>

        {/* Navigation Cards */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Quick Access</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <NavCard href="/people/portal" icon={User} title="My Portal" description="Self-service employee portal" />
            <NavCard href="/people/rosters" icon={Users} title="Rosters" description="Staff, crew, contractors & talent" />
            <NavCard href="/people/scheduling" icon={CalendarDays} title="Scheduling" description="Person schedule assignments" />
            <NavCard href="/people/timekeeping" icon={Clock} title="Time & Attendance" description="Clock in/out and timesheets" />
            <NavCard href="/people/org" icon={Building2} title="Org Chart" description="Organization structure" />
            <NavCard href="/people/compliance" icon={ShieldCheck} title="Compliance" description="Certifications & training status" />
            <NavCard href="/people/leave" icon={Palmtree} title="Leave Management" description="Request time off and view calendar" />
            <NavCard href="/people/documents" icon={FileText} title="Documents" description="Employee documents and files" />
            <NavCard href="/people/analytics" icon={BarChart3} title="Workforce Analytics" description="AI-powered insights and predictions" />
          </div>
        </div>
      </div>
    </div>
  );
}
