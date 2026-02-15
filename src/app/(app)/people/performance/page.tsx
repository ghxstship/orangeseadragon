'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrudList } from '@/lib/crud/components/CrudList';
import { performanceReviewSchema } from '@/lib/schemas/performanceReview';
import { PerformanceReviewDashboard } from '@/components/people/PerformanceReviewDashboard';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-supabase';
import { PageShell } from '@/components/common/page-shell';

type ReviewStatus = 'not_started' | 'self_review' | 'manager_review' | 'calibration' | 'completed';

interface EmployeeReview {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  status: ReviewStatus;
  selfReviewComplete: boolean;
  managerReviewComplete: boolean;
  overallRating?: number;
  dueDate: Date;
}

function mapReviewStatus(status: string | null): ReviewStatus {
  if (status === 'completed') return 'completed';
  if (status === 'calibration') return 'calibration';
  if (status === 'manager_review') return 'manager_review';
  if (status === 'self_review') return 'self_review';
  return 'not_started';
}

export default function PerformancePage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reviews, setReviews] = useState<EmployeeReview[]>([]);

  useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();

    const fetchReviews = async () => {
      const { data } = await supabase
        .from('performance_reviews')
        .select('id, employee_id, status, overall_rating, due_date, completed_at, review_period')
        .eq('org_id', orgId)
        .order('due_date', { ascending: false })
        .limit(50);

      // Fetch user names for employees
      const empIds = Array.from(new Set((data ?? []).map(d => d.employee_id)));
      const { data: staffRows } = empIds.length > 0
        ? await supabase.from('staff_members').select('id, user_id, department_id').in('id', empIds)
        : { data: [] };
      const userIds = (staffRows ?? []).map(s => s.user_id).filter(Boolean);
      const { data: users } = userIds.length > 0
        ? await supabase.from('users').select('id, full_name').in('id', userIds)
        : { data: [] };
      const userMap = new Map((users ?? []).map(u => [u.id, u.full_name ?? 'Unknown']));
      const staffMap = new Map((staffRows ?? []).map(s => [s.id, s]));

      const { data: depts } = await supabase
        .from('departments')
        .select('id, name')
        .eq('organization_id', orgId);
      const deptMap = new Map((depts ?? []).map(d => [d.id, d.name]));

      const mapped: EmployeeReview[] = (data ?? []).map((r) => {
        const staff = staffMap.get(r.employee_id);
        const userName = staff ? (userMap.get(staff.user_id) ?? 'Unknown') : 'Unknown';
        const deptName = staff?.department_id ? (deptMap.get(staff.department_id) ?? '') : '';
        const status = mapReviewStatus(r.status);
        const rating = r.overall_rating ? parseFloat(r.overall_rating) : undefined;
        return {
          id: r.id,
          employeeId: r.employee_id,
          employeeName: userName,
          department: deptName,
          status,
          selfReviewComplete: status === 'manager_review' || status === 'calibration' || status === 'completed',
          managerReviewComplete: status === 'calibration' || status === 'completed',
          overallRating: rating && !isNaN(rating) ? rating : undefined,
          dueDate: r.due_date ? new Date(r.due_date) : new Date(),
        };
      });

      setReviews(mapped);
    };

    fetchReviews();
  }, [orgId]);

  return (
    <PageShell
      title="Performance Management"
      description="Reviews, goals, and continuous feedback"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reviews">All Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <PerformanceReviewDashboard
            reviews={reviews.length > 0 ? reviews : undefined}
            onStartReview={() => { /* TODO: implement start review */ }}
            onViewReview={() => { /* TODO: implement view review */ }}
          />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <CrudList schema={performanceReviewSchema} />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
