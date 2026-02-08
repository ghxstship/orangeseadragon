'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Award,
  Bell,
  Download,
  ChevronRight,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ComplianceItem {
  id: string;
  type: 'certification' | 'training' | 'policy';
  name: string;
  employeeName: string;
  employeeId: string;
  expiryDate?: Date;
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  daysUntilExpiry?: number;
}

interface ComplianceStats {
  compliant: number;
  expiring: number;
  expired: number;
  pending: number;
  trainingCompletionRate: number;
  totalEmployees: number;
}

interface ComplianceDashboardProps {
  stats?: ComplianceStats;
  items?: ComplianceItem[];
  onSendReminder?: (itemIds: string[]) => void;
  onExport?: () => void;
}

const DEFAULT_STATS: ComplianceStats = {
  compliant: 234,
  expiring: 12,
  expired: 3,
  pending: 8,
  trainingCompletionRate: 78,
  totalEmployees: 250,
};

const DEFAULT_ITEMS: ComplianceItem[] = [
  { id: '1', type: 'certification', name: 'Safety Certification', employeeName: 'John Smith', employeeId: 'EMP001', expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'expiring', daysUntilExpiry: 7 },
  { id: '2', type: 'certification', name: 'First Aid', employeeName: 'Jane Doe', employeeId: 'EMP002', expiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), status: 'expiring', daysUntilExpiry: 21 },
  { id: '3', type: 'certification', name: 'Forklift License', employeeName: 'Mike Johnson', employeeId: 'EMP003', expiryDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), status: 'expiring', daysUntilExpiry: 28 },
  { id: '4', type: 'training', name: 'Harassment Prevention', employeeName: 'Sarah Williams', employeeId: 'EMP004', status: 'pending' },
  { id: '5', type: 'certification', name: 'CPR Certification', employeeName: 'Tom Brown', employeeId: 'EMP005', expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'expired', daysUntilExpiry: -5 },
  { id: '6', type: 'policy', name: 'Code of Conduct', employeeName: 'Lisa Anderson', employeeId: 'EMP006', status: 'pending' },
];

export function ComplianceDashboard({
  stats = DEFAULT_STATS,
  items = DEFAULT_ITEMS,
  onSendReminder,
  onExport,
}: ComplianceDashboardProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusConfig = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'valid':
        return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case 'expiring':
        return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      case 'expired':
        return { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
      case 'pending':
        return { icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    }
  };

  const getTypeIcon = (type: ComplianceItem['type']) => {
    switch (type) {
      case 'certification': return Award;
      case 'training': return FileText;
      case 'policy': return Shield;
    }
  };

  const expiringItems = items.filter(i => i.status === 'expiring' || i.status === 'expired');
  const pendingItems = items.filter(i => i.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Compliance Overview
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Monitor certifications, training, and policy acknowledgments
          </p>
        </div>
        <Button variant="outline" onClick={onExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card className="bg-emerald-500/10 border-emerald-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-300/70">Compliant</p>
                  <p className="text-3xl font-bold text-emerald-400">{stats.compliant}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
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
          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-300/70">Expiring Soon</p>
                  <p className="text-3xl font-bold text-amber-400">{stats.expiring}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400" />
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
          <Card className="bg-rose-500/10 border-rose-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-rose-300/70">Expired</p>
                  <p className="text-3xl font-bold text-rose-400">{stats.expired}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300/70">Pending</p>
                  <p className="text-3xl font-bold text-blue-400">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Training Completion */}
      <Card className="bg-zinc-900/60 border-border">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-300 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Required Training Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">
                {Math.round(stats.trainingCompletionRate * stats.totalEmployees / 100)} of {stats.totalEmployees} employees completed
              </span>
              <span className="text-white font-medium">{stats.trainingCompletionRate}%</span>
            </div>
            <Progress value={stats.trainingCompletionRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Expiring/Expired Items */}
      <Card className="bg-zinc-900/60 border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-zinc-300">
            Expiring Soon (Next 30 Days)
          </CardTitle>
          {selectedItems.length > 0 && (
            <Button 
              size="sm" 
              onClick={() => onSendReminder?.(selectedItems)}
              className="gap-2"
            >
              <Bell className="w-4 h-4" />
              Send Reminders ({selectedItems.length})
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {expiringItems.map((item) => {
              const statusConfig = getStatusConfig(item.status);
              const TypeIcon = getTypeIcon(item.type);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                    statusConfig.bg,
                    statusConfig.border,
                    selectedItems.includes(item.id) && "ring-2 ring-primary"
                  )}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className={cn("p-2 rounded-lg", statusConfig.bg)}>
                    <StatusIcon className={cn("w-5 h-5", statusConfig.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-4 h-4 text-zinc-500" />
                      <span className="font-medium text-white">{item.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400 mt-0.5">{item.employeeName}</p>
                  </div>

                  <div className="text-right">
                    {item.daysUntilExpiry !== undefined && (
                      <p className={cn(
                        "text-sm font-medium",
                        item.daysUntilExpiry < 0 ? "text-rose-400" : 
                        item.daysUntilExpiry <= 7 ? "text-rose-400" :
                        item.daysUntilExpiry <= 30 ? "text-amber-400" : "text-zinc-400"
                      )}>
                        {item.daysUntilExpiry < 0 
                          ? `Expired ${Math.abs(item.daysUntilExpiry)} days ago`
                          : `Expires in ${item.daysUntilExpiry} days`
                        }
                      </p>
                    )}
                    {item.expiryDate && (
                      <p className="text-xs text-zinc-500">
                        {item.expiryDate.toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-zinc-600" />
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Acknowledgments */}
      {pendingItems.length > 0 && (
        <Card className="bg-zinc-900/60 border-border">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-300">
              Pending Acknowledgments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingItems.map((item) => {
                const statusConfig = getStatusConfig(item.status);
                const TypeIcon = getTypeIcon(item.type);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border",
                      statusConfig.bg,
                      statusConfig.border
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", statusConfig.bg)}>
                      <TypeIcon className={cn("w-5 h-5", statusConfig.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{item.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400 mt-0.5">{item.employeeName}</p>
                    </div>

                    <Button size="sm" variant="outline">
                      Send Reminder
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
