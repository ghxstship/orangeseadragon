'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/common/page-shell';
import { StatCard, StatGrid } from '@/components/common/stat-card';
import { StaggerList, StaggerItem } from '@/components/ui/motion';
import { useCopilotContext } from '@/hooks/use-copilot-context';
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
  RefreshCw,
  GraduationCap,
  Plane,
  Star,
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
  const router = useRouter();
  useCopilotContext({ module: 'people' });

  return (
    <PageShell
      title="People"
      description="Human resources management"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => router.push('/people/rosters')}>
            <Users className="h-4 w-4 mr-2" />
            Directory
          </Button>
        </div>
      }
      contentClassName="space-y-8"
    >
        {/* KPI Stats */}
        <StatGrid columns={4}>
          <StatCard title="Total Staff" value="245" icon={Users} />
          <StatCard title="Available Now" value="89" icon={UserCheck} />
          <StatCard title="On Assignment" value="156" icon={Briefcase} />
          <StatCard title="Pending Onboard" value="12" icon={UserPlus} trend={{ value: 12, isPositive: true }} />
        </StatGrid>

        {/* Navigation Cards */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-4">Quick Access</h2>
          <StaggerList className="grid gap-3 md:grid-cols-3">
            <StaggerItem><NavCard href="/people/portal" icon={User} title="My Portal" description="Self-service employee portal" /></StaggerItem>
            <StaggerItem><NavCard href="/people/rosters" icon={Users} title="Rosters" description="Staff, crew, contractors & talent" /></StaggerItem>
            <StaggerItem><NavCard href="/people/scheduling" icon={CalendarDays} title="Scheduling" description="Person schedule assignments" /></StaggerItem>
            <StaggerItem><NavCard href="/people/timekeeping" icon={Clock} title="Time & Attendance" description="Clock in/out and timesheets" /></StaggerItem>
            <StaggerItem><NavCard href="/people/org" icon={Building2} title="Org Chart" description="Organization structure" /></StaggerItem>
            <StaggerItem><NavCard href="/people/compliance" icon={ShieldCheck} title="Compliance" description="Certifications & training status" /></StaggerItem>
            <StaggerItem><NavCard href="/people/leave" icon={Palmtree} title="Leave Management" description="Request time off and view calendar" /></StaggerItem>
            <StaggerItem><NavCard href="/people/documents" icon={FileText} title="Documents" description="Employee documents and files" /></StaggerItem>
            <StaggerItem><NavCard href="/people/training" icon={GraduationCap} title="Training" description="Courses, certifications & LMS" /></StaggerItem>
            <StaggerItem><NavCard href="/people/travel" icon={Plane} title="Travel" description="Bookings, flights & accommodations" /></StaggerItem>
            <StaggerItem><NavCard href="/people/performance" icon={Star} title="Performance" description="Reviews, goals & feedback" /></StaggerItem>
            <StaggerItem><NavCard href="/people/analytics" icon={BarChart3} title="Workforce Analytics" description="AI-powered insights and predictions" /></StaggerItem>
          </StaggerList>
        </div>
    </PageShell>
  );
}
