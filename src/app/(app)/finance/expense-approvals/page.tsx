'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/common/page-shell';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';
import { ExpenseApprovalCard } from '../components/ExpenseApprovalCard';
import { Search, Filter, CheckCheck, Loader2 } from 'lucide-react';

interface ExpenseApproval {
  id: string;
  expense: {
    id: string;
    description: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
    receiptUrl?: string;
  };
  submittedBy: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  submittedAt: string;
  currentLevel: number;
  totalLevels: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  notes?: string;
}

interface ExpenseApprovalApiExpense {
  id?: string | null;
  description?: string | null;
  amount?: number | null;
  currency?: string | null;
  category?: string | null;
  expense_date?: string | null;
  receipt_url?: string | null;
}

interface ExpenseApprovalApiRow {
  id: string;
  status?: string | null;
  current_level?: number | null;
  submitted_at?: string | null;
  submitted_by?: string | null;
  notes?: string | null;
  policy?: {
    approval_levels?: number | null;
  } | null;
  expense?: ExpenseApprovalApiExpense | null;
}

interface ExpenseApprovalApiResponse {
  data?: ExpenseApprovalApiRow[];
}

function normalizeApprovalStatus(status: string | null | undefined): ExpenseApproval['status'] {
  switch (status) {
    case 'approved':
    case 'rejected':
    case 'cancelled':
    case 'pending':
      return status;
    case 'returned':
      return 'cancelled';
    default:
      return 'pending';
  }
}

function mapApprovalToViewModel(row: ExpenseApprovalApiRow): ExpenseApproval {
  const submittedAt = row.submitted_at || new Date().toISOString();
  const expenseDate = row.expense?.expense_date || submittedAt;

  return {
    id: row.id,
    expense: {
      id: row.expense?.id || row.id,
      description: row.expense?.description || 'Untitled expense',
      amount: row.expense?.amount ?? 0,
      currency: row.expense?.currency || 'USD',
      category: row.expense?.category || 'Uncategorized',
      date: expenseDate,
      receiptUrl: row.expense?.receipt_url || undefined,
    },
    submittedBy: {
      id: row.submitted_by || 'unknown',
      name: 'Unknown submitter',
      email: '',
    },
    submittedAt,
    currentLevel: row.current_level ?? 1,
    totalLevels: row.policy?.approval_levels ?? 1,
    status: normalizeApprovalStatus(row.status),
    notes: row.notes || undefined,
  };
}

export default function ExpenseApprovalsPage() {
  const [approvals, setApprovals] = useState<ExpenseApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/expense-approval-requests');
      if (response.ok) {
        const payload: ExpenseApprovalApiResponse = await response.json();
        const nextApprovals = (Array.isArray(payload.data) ? payload.data : []).map(
          mapApprovalToViewModel
        );
        setApprovals(nextApprovals);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, comments?: string) => {
    const response = await fetch('/api/expense-approval-requests/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, comments }),
    });

    if (!response.ok) {
      throw new Error('Failed to approve');
    }

    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'approved' as const } : a))
    );
  };

  const handleReject = async (id: string, reason: string) => {
    const response = await fetch('/api/expense-approval-requests/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reason }),
    });

    if (!response.ok) {
      throw new Error('Failed to reject');
    }

    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'rejected' as const } : a))
    );
  };

  const handleReturn = async (id: string, comments: string) => {
    const response = await fetch('/api/expense-approval-requests/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reason: comments }),
    });

    if (!response.ok) {
      throw new Error('Failed to return');
    }

    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a))
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    setIsBulkProcessing(true);
    try {
      const response = await fetch('/api/expense-approval-requests/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (response.ok) {
        setApprovals((prev) =>
          prev.map((a) =>
            selectedIds.includes(a.id) ? { ...a, status: 'approved' as const } : a
          )
        );
        setSelectedIds([]);
      }
    } catch (error) {
      console.error('Error bulk approving:', error);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch =
      approval.expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'all' || approval.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <PageShell
      title="Expense Approvals"
      description="Review and approve expense submissions"
      actions={pendingCount > 0 ? <Badge variant="secondary">{pendingCount} pending</Badge> : undefined}
      contentClassName="space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              onClick={handleBulkApprove}
              disabled={isBulkProcessing}
              size="sm"
            >
              {isBulkProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="mr-2 h-4 w-4" />
              )}
              Approve {selectedIds.length} Selected
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-56 w-full" />
              ))}
            </div>
          ) : filteredApprovals.length === 0 ? (
            <ContextualEmptyState
              type="no-data"
              title={activeTab === 'pending' ? 'No expenses pending approval' : 'No expenses found'}
              description="Incoming approval requests will appear here when submitted."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredApprovals.map((approval) => (
                <ExpenseApprovalCard
                  key={approval.id}
                  approval={approval}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onReturn={handleReturn}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
