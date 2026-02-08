'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  FileText, 
  Clock, 
  Bell,
  Settings,
  ChevronRight,
  Palmtree,
  CreditCard,
  Award,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface EmployeeData {
  id: string;
  name: string;
  title: string;
  department: string;
  avatarUrl?: string;
  email: string;
  startDate: Date;
  manager?: string;
}

interface LeaveBalance {
  type: string;
  available: number;
  used: number;
  total: number;
}

interface PendingItem {
  id: string;
  type: 'approval' | 'task' | 'review' | 'training';
  title: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

interface EmployeePortalProps {
  employee?: EmployeeData;
  leaveBalances?: LeaveBalance[];
  pendingItems?: PendingItem[];
  nextShift?: { date: Date; time: string; location: string };
  onRequestTimeOff?: () => void;
  onViewSchedule?: () => void;
  onUpdateProfile?: () => void;
  onViewPayslips?: () => void;
}

const DEFAULT_EMPLOYEE: EmployeeData = {
  id: 'EMP001',
  name: 'Sarah Chen',
  title: 'Senior Software Engineer',
  department: 'Engineering',
  email: 'sarah.chen@atlvs.com',
  startDate: new Date('2023-06-15'),
  manager: 'Tom Wilson',
};

const DEFAULT_LEAVE_BALANCES: LeaveBalance[] = [
  { type: 'Annual Leave', available: 12, used: 8, total: 20 },
  { type: 'Sick Leave', available: 8, used: 2, total: 10 },
  { type: 'Personal Days', available: 2, used: 1, total: 3 },
];

const DEFAULT_PENDING: PendingItem[] = [
  { id: '1', type: 'approval', title: 'PTO Request Approved', priority: 'medium' },
  { id: '2', type: 'training', title: 'Complete Safety Training', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), priority: 'high' },
  { id: '3', type: 'review', title: 'Performance Review Due', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), priority: 'medium' },
];

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'pto', label: 'Request Time Off', icon: Palmtree, href: '/people/leave/new', color: 'text-emerald-400' },
  { id: 'schedule', label: 'View Schedule', icon: Calendar, href: '/people/scheduling', color: 'text-blue-400' },
  { id: 'profile', label: 'Update Profile', icon: User, href: '/people/profile', color: 'text-purple-400' },
  { id: 'payslips', label: 'View Payslips', icon: CreditCard, href: '/people/payslips', color: 'text-amber-400' },
];

export function EmployeePortal({
  employee = DEFAULT_EMPLOYEE,
  leaveBalances = DEFAULT_LEAVE_BALANCES,
  pendingItems = DEFAULT_PENDING,
  nextShift,
  onRequestTimeOff,
  onViewSchedule,
  onUpdateProfile,
  onViewPayslips,
}: EmployeePortalProps) {
  
  const getPriorityColor = (priority: PendingItem['priority']) => {
    switch (priority) {
      case 'high': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getTypeIcon = (type: PendingItem['type']) => {
    switch (type) {
      case 'approval': return CheckCircle2;
      case 'task': return FileText;
      case 'review': return TrendingUp;
      case 'training': return BookOpen;
    }
  };

  const totalPtoAvailable = leaveBalances.reduce((sum, b) => sum + b.available, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/40 border-white/10 overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/10">
                {employee.avatarUrl ? (
                  <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                ) : (
                  <AvatarFallback className="bg-zinc-800 text-xl">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {employee.name.split(' ')[0]}
                </h1>
                <p className="text-zinc-400">
                  {employee.title} · {employee.department}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {pendingItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[10px] flex items-center justify-center">
                    {pendingItems.length}
                  </span>
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-zinc-900/60 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">PTO Balance</p>
                  <p className="text-3xl font-bold text-white">{totalPtoAvailable} days</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Palmtree className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-zinc-900/60 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Next Shift</p>
                  <p className="text-xl font-bold text-white">
                    {nextShift ? nextShift.time : 'Mon 9:00 AM'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {nextShift?.location || 'Main Office'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-zinc-900/60 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Pending</p>
                  <p className="text-3xl font-bold text-white">{pendingItems.length}</p>
                  <p className="text-xs text-zinc-500">items need attention</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-zinc-900/60 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-300">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-zinc-800/50 border-white/10 hover:bg-zinc-700/50"
                  onClick={() => {
                    if (action.id === 'pto') onRequestTimeOff?.();
                    if (action.id === 'schedule') onViewSchedule?.();
                    if (action.id === 'profile') onUpdateProfile?.();
                    if (action.id === 'payslips') onViewPayslips?.();
                  }}
                >
                  <Icon className={cn("w-6 h-6", action.color)} />
                  <span className="text-sm text-zinc-300">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Balances */}
        <Card className="bg-zinc-900/60 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-zinc-300">Leave Balances</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaveBalances.map((balance) => (
              <div key={balance.type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">{balance.type}</span>
                  <span className="text-white font-medium">
                    {balance.available} of {balance.total} days
                  </span>
                </div>
                <Progress 
                  value={(balance.available / balance.total) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity / Pending Items */}
        <Card className="bg-zinc-900/60 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-300">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingItems.map((item) => {
              const Icon = getTypeIcon(item.type);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    getPriorityColor(item.priority)
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    {item.dueDate && (
                      <p className="text-xs text-zinc-500">
                        Due {item.dueDate.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Certifications & Training */}
      <Card className="bg-zinc-900/60 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-zinc-300 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certifications & Training
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">Valid</span>
              </div>
              <p className="text-white font-medium">Safety Certification</p>
              <p className="text-xs text-zinc-500">Expires Dec 2026</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">Expiring</span>
              </div>
              <p className="text-white font-medium">First Aid</p>
              <p className="text-xs text-zinc-500">Expires in 30 days</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">In Progress</span>
              </div>
              <p className="text-white font-medium">Leadership Training</p>
              <p className="text-xs text-zinc-500">60% complete</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
