'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrudList } from '@/lib/crud/components/CrudList';
import { leaveRequestSchema } from '@/lib/schemas/leaveRequest';
import { LeaveCalendar } from '@/components/people/LeaveCalendar';
import { LeaveRequestForm } from '@/components/people/LeaveRequestForm';
import { PageShell } from '@/components/common/page-shell';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-supabase';
import { useRouter } from 'next/navigation';

type LeaveType = 'annual' | 'sick' | 'parental' | 'bereavement' | 'study' | 'unpaid';
type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  reason?: string;
}

function mapLeaveStatus(status: string | null): LeaveStatus {
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
}

function mapLeaveType(typeId: string | null, typeMap: Map<string, string>): LeaveType {
  if (!typeId) return 'annual';
  const name = (typeMap.get(typeId) ?? '').toLowerCase();
  if (name.includes('sick')) return 'sick';
  if (name.includes('parental') || name.includes('maternity') || name.includes('paternity')) return 'parental';
  if (name.includes('bereavement')) return 'bereavement';
  if (name.includes('study') || name.includes('training')) return 'study';
  if (name.includes('unpaid')) return 'unpaid';
  return 'annual';
}

export default function LeavePage() {
  const router = useRouter();
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const [activeTab, setActiveTab] = useState('calendar');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();

    const fetchLeave = async () => {
      const { data: leaveTypes } = await supabase
        .from('leave_types')
        .select('id, name')
        .eq('organization_id', orgId);
      const typeMap = new Map((leaveTypes ?? []).map(t => [t.id, t.name]));

      const { data } = await supabase
        .from('leave_requests')
        .select('id, staff_member_id, leave_type_id, start_date, end_date, status, reason')
        .eq('organization_id', orgId)
        .order('start_date', { ascending: false })
        .limit(100);

      const staffIds = Array.from(new Set((data ?? []).map(d => d.staff_member_id)));
      const { data: staffRows } = staffIds.length > 0
        ? await supabase.from('staff_members').select('id, user_id').in('id', staffIds)
        : { data: [] };
      const userIds = (staffRows ?? []).map(s => s.user_id).filter(Boolean);
      const { data: users } = userIds.length > 0
        ? await supabase.from('users').select('id, full_name').in('id', userIds)
        : { data: [] };
      const userMap = new Map((users ?? []).map(u => [u.id, u.full_name ?? 'Unknown']));
      const staffUserMap = new Map((staffRows ?? []).map(s => [s.id, s.user_id]));

      const mapped: LeaveRequest[] = (data ?? []).map((r) => {
        const userId = staffUserMap.get(r.staff_member_id);
        return {
          id: r.id,
          employeeId: r.staff_member_id,
          employeeName: userId ? (userMap.get(userId) ?? 'Unknown') : 'Unknown',
          leaveType: mapLeaveType(r.leave_type_id, typeMap),
          startDate: new Date(r.start_date),
          endDate: new Date(r.end_date),
          status: mapLeaveStatus(r.status),
          reason: r.reason ?? undefined,
        };
      });

      setRequests(mapped);
    };

    fetchLeave();
  }, [orgId]);

  // Compute leave balances from approved requests for current user
  const balances = useMemo(() => {
    const myRequests = requests.filter(r => r.status === 'approved');
    let annualUsed = 0;
    let sickUsed = 0;
    let personalUsed = 0;
    for (const r of myRequests) {
      const days = Math.ceil((r.endDate.getTime() - r.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (r.leaveType === 'annual') annualUsed += days;
      else if (r.leaveType === 'sick') sickUsed += days;
      else personalUsed += days;
    }
    return { annualUsed, sickUsed, personalUsed };
  }, [requests]);

  return (
    <PageShell
      title="Leave Management"
      description="Request time off and view team availability"
      contentPadding={false}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-auto px-4 pt-6 sm:px-6">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="requests">All Requests</TabsTrigger>
          <TabsTrigger value="balances">My Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <LeaveCalendar
            requests={requests.length > 0 ? requests : undefined}
            onNewRequest={() => setShowRequestForm(true)}
            onRequestClick={(request) => {
              if (request?.id) router.push(`/people/leave/${request.id}`);
            }}
            onDateClick={() => setShowRequestForm(true)}
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <CrudList schema={leaveRequestSchema} />
        </TabsContent>

        <TabsContent value="balances" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">Annual Leave</p>
              <p className="text-3xl font-bold text-primary mt-1">{20 - balances.annualUsed} days</p>
              <p className="text-xs text-muted-foreground mt-2">of 20 days remaining</p>
            </div>
            <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-muted-foreground">Sick Leave</p>
              <p className="text-3xl font-bold text-destructive mt-1">{10 - balances.sickUsed} days</p>
              <p className="text-xs text-muted-foreground mt-2">of 10 days remaining</p>
            </div>
            <div className="p-6 rounded-xl bg-accent border">
              <p className="text-sm text-muted-foreground">Personal Days</p>
              <p className="text-3xl font-bold mt-1">{3 - balances.personalUsed} days</p>
              <p className="text-xs text-muted-foreground mt-2">of 3 days remaining</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="max-w-2xl">
          <LeaveRequestForm
            onSubmit={async (formData) => {
              try {
                await fetch('/api/leave-requests', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData),
                });
                setShowRequestForm(false);
                // Refresh data
                window.location.reload();
              } catch (err) {
                console.error('Leave request submission failed:', err);
              }
            }}
            onCancel={() => setShowRequestForm(false)}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
