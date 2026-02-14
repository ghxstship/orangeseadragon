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
  { id: 'pto', label: 'Request Time Off', icon: Palmtree, href: '/people/leave/new', color: 'text-semantic-success' },
  { id: 'schedule', label: 'View Schedule', icon: Calendar, href: '/people/scheduling', color: 'text-semantic-info' },
  { id: 'profile', label: 'Update Profile', icon: User, href: '/people/profile', color: 'text-semantic-purple' },
  { id: 'payslips', label: 'View Payslips', icon: CreditCard, href: '/people/payslips', color: 'text-semantic-warning' },
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
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'medium': return 'text-semantic-warning bg-semantic-warning/10 border-semantic-warning/20';
      case 'low': return 'text-semantic-info bg-semantic-info/10 border-semantic-info/20';
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
      <Card className="bg-gradient-to-br from-card to-muted/50 border-border overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-border">
                {employee.avatarUrl ? (
                  <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                ) : (
                  <AvatarFallback className="bg-muted text-xl">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome back, {employee.name.split(' ')[0]}
                </h1>
                <p className="text-muted-foreground">
                  {employee.title} · {employee.department}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {pendingItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center">
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
          <Card className="bg-card/80 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">PTO Balance</p>
                  <p className="text-3xl font-bold text-white">{totalPtoAvailable} days</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-semantic-success/20 flex items-center justify-center">
                  <Palmtree className="w-6 h-6 text-semantic-success" />
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
          <Card className="bg-card/80 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Shift</p>
                  <p className="text-xl font-bold text-white">
                    {nextShift ? nextShift.time : 'Mon 9:00 AM'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {nextShift?.location || 'Main Office'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-semantic-info/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-semantic-info" />
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
          <Card className="bg-card/80 border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-white">{pendingItems.length}</p>
                  <p className="text-xs text-muted-foreground">items need attention</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-semantic-warning/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-semantic-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card/80 border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-card/70 border-border hover:bg-muted/50"
                  onClick={() => {
                    if (action.id === 'pto') onRequestTimeOff?.();
                    if (action.id === 'schedule') onViewSchedule?.();
                    if (action.id === 'profile') onUpdateProfile?.();
                    if (action.id === 'payslips') onViewPayslips?.();
                  }}
                >
                  <Icon className={cn("w-6 h-6", action.color)} />
                  <span className="text-sm text-foreground">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Balances */}
        <Card className="bg-card/80 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">Leave Balances</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaveBalances.map((balance) => (
              <div key={balance.type} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{balance.type}</span>
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
        <Card className="bg-card/80 border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Recent Activity</CardTitle>
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
                      <p className="text-xs text-muted-foreground">
                        Due {item.dueDate.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/70" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Certifications & Training */}
      <Card className="bg-card/80 border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certifications & Training
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-semantic-success/10 border border-semantic-success/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-semantic-success" />
                <span className="text-sm font-medium text-semantic-success">Valid</span>
              </div>
              <p className="text-white font-medium">Safety Certification</p>
              <p className="text-xs text-muted-foreground">Expires Dec 2026</p>
            </div>
            <div className="p-4 rounded-lg bg-semantic-warning/10 border border-semantic-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-semantic-warning" />
                <span className="text-sm font-medium text-semantic-warning">Expiring</span>
              </div>
              <p className="text-white font-medium">First Aid</p>
              <p className="text-xs text-muted-foreground">Expires in 30 days</p>
            </div>
            <div className="p-4 rounded-lg bg-semantic-info/10 border border-semantic-info/20">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-semantic-info" />
                <span className="text-sm font-medium text-semantic-info">In Progress</span>
              </div>
              <p className="text-white font-medium">Leadership Training</p>
              <p className="text-xs text-muted-foreground">60% complete</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
