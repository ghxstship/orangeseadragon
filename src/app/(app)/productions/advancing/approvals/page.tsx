'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/common/page-shell';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';

interface ApprovalRequest {
  id: string;
  advance_id: string;
  advance_code: string;
  event_name: string;
  requested_by: string;
  requested_by_name: string;
  advance_type: string;
  total_items: number;
  total_cost: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  submitted_at: string;
  reviewed_at?: string;
  reviewer_name?: string;
  notes?: string;
}

const priorityVariant: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'secondary',
  low: 'secondary',
};

export default function ApprovalsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/advancing/approvals');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data || data.records || []);
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'revision') => {
    try {
      const res = await fetch(`/api/advancing/approvals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast({
          title: action === 'approve' ? 'Advance Approved' : action === 'reject' ? 'Advance Rejected' : 'Revision Requested',
          description: `Advance has been ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'sent back for revision'}.`,
        });
        fetchApprovals();
      }
    } catch (error) {
      console.error(`Failed to ${action} advance:`, error);
      toast({ title: 'Error', description: `Failed to ${action} advance.`, variant: 'destructive' });
    }
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const reviewed = requests.filter((r) => r.status !== 'pending');

  const renderCard = (request: ApprovalRequest) => (
    <Card key={request.id} className="hover:bg-accent/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
              <AvatarFallback>{request.requested_by_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{request.advance_code}</span>
                <Badge variant={priorityVariant[request.priority] || 'secondary'} className="text-[10px]">
                  {request.priority}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {request.advance_type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                {request.event_name} • {request.total_items} items • {formatCurrency(request.total_cost)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Submitted by {request.requested_by_name} • {new Date(request.submitted_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {request.status === 'pending' ? (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => handleAction(request.id, 'reject')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAction(request.id, 'revision')}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Revise
              </Button>
              <Button
                size="sm"
                onClick={() => handleAction(request.id, 'approve')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          ) : (
            <Badge
              variant={
                request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'destructive' : 'warning'
              }
            >
              {request.status === 'needs_revision' ? 'Needs Revision' : request.status}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageShell
      title="Approvals"
      description="Review and approve pending advance requests"
      icon={<ShieldCheck className="h-6 w-6" />}
      actions={
        <div className="flex items-center gap-2">
          {pending.length > 0 && (
            <Badge variant="warning" className="h-7 px-3">
              {pending.length} pending
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={fetchApprovals}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      }
    >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="underline" className="mb-4">
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-1.5" />
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Reviewed ({reviewed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-[110px] w-full rounded-lg" />
                  <Skeleton className="h-[110px] w-full rounded-lg" />
                </>
              ) : pending.length === 0 ? (
                <ContextualEmptyState
                  type="no-data"
                  icon={CheckCircle2}
                  title="All caught up"
                  description="No pending approvals."
                />
              ) : (
                pending.map(renderCard)
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviewed">
            <div className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-[110px] w-full rounded-lg" />
                  <Skeleton className="h-[110px] w-full rounded-lg" />
                </>
              ) : reviewed.length === 0 ? (
                <ContextualEmptyState
                  type="no-data"
                  icon={ShieldCheck}
                  title="No reviewed approvals yet"
                  description="Approved, rejected, and revision-requested items will appear here."
                />
              ) : (
                reviewed.map(renderCard)
              )}
            </div>
          </TabsContent>
        </Tabs>
    </PageShell>
  );
}
