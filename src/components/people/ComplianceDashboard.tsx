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
        return { icon: CheckCircle2, color: 'text-semantic-success', bg: 'bg-semantic-success/10', border: 'border-semantic-success/20' };
      case 'expiring':
        return { icon: Clock, color: 'text-semantic-warning', bg: 'bg-semantic-warning/10', border: 'border-semantic-warning/20' };
      case 'expired':
        return { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' };
      case 'pending':
        return { icon: FileText, color: 'text-semantic-info', bg: 'bg-semantic-info/10', border: 'border-semantic-info/20' };
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
          <p className="text-sm text-muted-foreground mt-1">
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
          <Card className="bg-semantic-success/10 border-semantic-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-semantic-success/70">Compliant</p>
                  <p className="text-3xl font-bold text-semantic-success">{stats.compliant}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-semantic-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-semantic-success" />
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
          <Card className="bg-semantic-warning/10 border-semantic-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-semantic-warning/70">Expiring Soon</p>
                  <p className="text-3xl font-bold text-semantic-warning">{stats.expiring}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-semantic-warning/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-semantic-warning" />
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
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-destructive/70">Expired</p>
                  <p className="text-3xl font-bold text-destructive">{stats.expired}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
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
          <Card className="bg-semantic-info/10 border-semantic-info/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-semantic-info/70">Pending</p>
                  <p className="text-3xl font-bold text-semantic-info">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-semantic-info/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-semantic-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Training Completion */}
      <Card className="bg-card/80 border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Required Training Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {Math.round(stats.trainingCompletionRate * stats.totalEmployees / 100)} of {stats.totalEmployees} employees completed
              </span>
              <span className="text-white font-medium">{stats.trainingCompletionRate}%</span>
            </div>
            <Progress value={stats.trainingCompletionRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Expiring/Expired Items */}
      <Card className="bg-card/80 border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-foreground">
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
                      <TypeIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-white">{item.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.employeeName}</p>
                  </div>

                  <div className="text-right">
                    {item.daysUntilExpiry !== undefined && (
                      <p className={cn(
                        "text-sm font-medium",
                        item.daysUntilExpiry < 0 ? "text-destructive" : 
                        item.daysUntilExpiry <= 7 ? "text-destructive" :
                        item.daysUntilExpiry <= 30 ? "text-semantic-warning" : "text-muted-foreground"
                      )}>
                        {item.daysUntilExpiry < 0 
                          ? `Expired ${Math.abs(item.daysUntilExpiry)} days ago`
                          : `Expires in ${item.daysUntilExpiry} days`
                        }
                      </p>
                    )}
                    {item.expiryDate && (
                      <p className="text-xs text-muted-foreground">
                        {item.expiryDate.toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground/70" />
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Acknowledgments */}
      {pendingItems.length > 0 && (
        <Card className="bg-card/80 border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
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
                      <p className="text-sm text-muted-foreground mt-0.5">{item.employeeName}</p>
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
