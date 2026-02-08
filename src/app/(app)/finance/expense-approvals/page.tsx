'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
        const data = await response.json();
        setApprovals(data);
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
      body: JSON.stringify({ requestId: id, comments }),
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
      body: JSON.stringify({ requestId: id, reason }),
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
      body: JSON.stringify({ requestId: id, comments }),
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
        body: JSON.stringify({ requestIds: selectedIds }),
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
    <div className="space-y-6">
      <PageHeader
        title="Expense Approvals"
        description="Review and approve expense submissions"
        badge={pendingCount > 0 ? `${pendingCount} pending` : undefined}
      />

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
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {activeTab === 'pending'
                ? 'No expenses pending approval'
                : 'No expenses found'}
            </div>
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
    </div>
  );
}
