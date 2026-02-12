'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  MoreHorizontal,
  Upload,
  Bell,
  FileText,
  Loader2,
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';

interface CertificationAlert {
  id: string;
  employeeName: string;
  employeeId: string;
  certificationName: string;
  certificationId: string;
  alertType: 'expiring_soon' | 'expired' | 'missing_required';
  expiryDate?: string;
  daysUntilExpiry?: number;
  isAcknowledged: boolean;
}

interface CertificationSummary {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
  missing: number;
}

interface EmployeeCertification {
  id: string;
  employeeId: string;
  employeeName: string;
  certificationName: string;
  certificationCategory: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'pending' | 'revoked';
  documentUrl?: string;
}

export function CertificationDashboard() {
  const [alerts, setAlerts] = useState<CertificationAlert[]>([]);
  const [certifications, setCertifications] = useState<EmployeeCertification[]>([]);
  const [summary, setSummary] = useState<CertificationSummary>({
    total: 0,
    valid: 0,
    expiringSoon: 0,
    expired: 0,
    missing: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [alertsRes, certsRes, summaryRes] = await Promise.all([
        fetch('/api/certification-alerts?unresolved=true'),
        fetch('/api/employee-certifications'),
        fetch('/api/certifications/summary'),
      ]);

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data);
      }
      if (certsRes.ok) {
        const data = await certsRes.json();
        setCertifications(data);
      }
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/certification-alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isAcknowledged: true } : a))
      );
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const sendReminder = async (employeeId: string, certificationId: string) => {
    try {
      await fetch('/api/certifications/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, certificationId }),
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const getStatusBadge = (status: string, expiryDate?: string) => {
    if (status === 'expired') {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (status === 'revoked') {
      return <Badge variant="destructive">Revoked</Badge>;
    }
    if (status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    }
    if (expiryDate) {
      const days = differenceInDays(new Date(expiryDate), new Date());
      if (days <= 0) {
        return <Badge variant="destructive">Expired</Badge>;
      }
      if (days <= 30) {
        return (
          <Badge variant="default" className="bg-amber-500 dark:bg-amber-400">
            Expires in {days}d
          </Badge>
        );
      }
    }
    return <Badge variant="default" className="bg-emerald-600 dark:bg-emerald-500">Valid</Badge>;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'expired':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'expiring_soon':
        return <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
      case 'missing_required':
        return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const complianceRate = summary.total > 0
    ? Math.round((summary.valid / summary.total) * 100)
    : 100;

  const filteredCertifications = certifications.filter(
    (cert) =>
      cert.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceRate}%</div>
            <Progress value={complianceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.valid}</div>
            <p className="text-xs text-muted-foreground">Active certifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.expired}</div>
            <p className="text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing</CardTitle>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.missing}</div>
            <p className="text-xs text-muted-foreground">Required certs</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="alerts" className="gap-2">
              Alerts
              {alerts.filter((a) => !a.isAcknowledged).length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {alerts.filter((a) => !a.isAcknowledged).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Certifications</TabsTrigger>
            <TabsTrigger value="calendar">Expiry Calendar</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>

        <TabsContent value="alerts" className="mt-6">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 dark:text-emerald-400 mb-4" />
                <h3 className="text-lg font-medium">All Clear!</h3>
                <p className="text-muted-foreground">No certification alerts at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={alert.isAcknowledged ? 'opacity-60' : ''}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      {getAlertIcon(alert.alertType)}
                      <div>
                        <p className="font-medium">{alert.employeeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.certificationName}
                          {alert.expiryDate && (
                            <> · Expires {format(new Date(alert.expiryDate), 'MMM d, yyyy')}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.daysUntilExpiry !== undefined && (
                        <Badge
                          variant={alert.daysUntilExpiry <= 0 ? 'destructive' : 'secondary'}
                        >
                          {alert.daysUntilExpiry <= 0
                            ? `${Math.abs(alert.daysUntilExpiry)} days overdue`
                            : `${alert.daysUntilExpiry} days left`}
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendReminder(alert.employeeId, alert.certificationId)}
                      >
                        <Bell className="mr-1 h-3 w-3" />
                        Remind
                      </Button>
                      {!alert.isAcknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Certification</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertifications.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.employeeName}</TableCell>
                    <TableCell>{cert.certificationName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cert.certificationCategory}</Badge>
                    </TableCell>
                    <TableCell>
                      {cert.issuedDate && format(new Date(cert.issuedDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {cert.expiryDate
                        ? format(new Date(cert.expiryDate), 'MMM d, yyyy')
                        : 'No expiry'}
                    </TableCell>
                    <TableCell>{getStatusBadge(cert.status, cert.expiryDate)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            View Document
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Renewal
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Bell className="mr-2 h-4 w-4" />
                            Send Reminder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Expirations</CardTitle>
              <CardDescription>
                Certifications expiring in the next 90 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[0, 30, 60, 90].map((daysOffset, index) => {
                  const startDate = addDays(new Date(), daysOffset);
                  const endDate = addDays(new Date(), daysOffset + 30);
                  const certsInRange = certifications.filter((cert) => {
                    if (!cert.expiryDate) return false;
                    const expiry = new Date(cert.expiryDate);
                    return expiry >= startDate && expiry < endDate;
                  });

                  if (index === 0) {
                    return (
                      <div key={daysOffset} className="space-y-2">
                        <h4 className="font-medium text-destructive">Next 30 Days</h4>
                        {certsInRange.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No expirations</p>
                        ) : (
                          certsInRange.map((cert) => (
                            <div
                              key={cert.id}
                              className="flex items-center justify-between rounded-lg border p-3"
                            >
                              <div>
                                <p className="font-medium">{cert.employeeName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {cert.certificationName}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {cert.expiryDate && format(new Date(cert.expiryDate), 'MMM d')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {cert.expiryDate &&
                                    differenceInDays(new Date(cert.expiryDate), new Date())}{' '}
                                  days
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
