'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Check, 
  X, 
  RotateCcw, 
  Receipt, 
  Calendar, 
  DollarSign,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ExpenseApprovalData {
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

interface ExpenseApprovalCardProps {
  approval: ExpenseApprovalData;
  onApprove: (id: string, comments?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onReturn: (id: string, comments: string) => Promise<void>;
}

export function ExpenseApprovalCard({
  approval,
  onApprove,
  onReject,
  onReturn,
}: ExpenseApprovalCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [returnComments, setReturnComments] = useState('');

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(approval.id);
      toast.success('Expense approved');
    } catch (error) {
      toast.error('Failed to approve expense');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setIsProcessing(true);
    try {
      await onReject(approval.id, rejectReason);
      toast.success('Expense rejected');
      setShowRejectDialog(false);
    } catch (error) {
      toast.error('Failed to reject expense');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturn = async () => {
    if (!returnComments.trim()) {
      toast.error('Please provide comments for the submitter');
      return;
    }
    setIsProcessing(true);
    try {
      await onReturn(approval.id, returnComments);
      toast.success('Expense returned for revision');
      setShowReturnDialog(false);
    } catch (error) {
      toast.error('Failed to return expense');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = () => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'default',
      approved: 'secondary',
      rejected: 'destructive',
      cancelled: 'outline',
    };
    return (
      <Badge variant={variants[approval.status] || 'default'}>
        {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
      </Badge>
    );
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={approval.submittedBy.avatarUrl} />
                <AvatarFallback>
                  {approval.submittedBy.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{approval.expense.description}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {approval.submittedBy.name}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold">
                  {approval.expense.currency} {approval.expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">{format(new Date(approval.expense.date), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{approval.expense.category}</Badge>
              {approval.expense.receiptUrl && (
                <Button variant="ghost" size="sm" className="h-7 gap-1" asChild>
                  <a href={approval.expense.receiptUrl} target="_blank" rel="noopener noreferrer">
                    <Receipt className="h-3 w-3" />
                    View Receipt
                  </a>
                </Button>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Level {approval.currentLevel} of {approval.totalLevels}
            </div>
          </div>

          {approval.notes && (
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Submitter Notes</p>
              <p className="text-sm">{approval.notes}</p>
            </div>
          )}

          {!approval.expense.receiptUrl && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">No receipt attached</span>
            </div>
          )}
        </CardContent>

        {approval.status === 'pending' && (
          <CardFooter className="gap-2 border-t bg-muted/30 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReturnDialog(true)}
              disabled={isProcessing}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Return
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowRejectDialog(true)}
              disabled={isProcessing}
            >
              <X className="mr-1 h-4 w-4" />
              Reject
            </Button>
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isProcessing}
              className="ml-auto"
            >
              {isProcessing ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-1 h-4 w-4" />
              )}
              Approve
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this expense. This will be visible to the submitter.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reject Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return for Revision</DialogTitle>
            <DialogDescription>
              Return this expense to the submitter for corrections. Please explain what needs to be changed.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="What needs to be corrected..."
            value={returnComments}
            onChange={(e) => setReturnComments(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturn} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Return for Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
