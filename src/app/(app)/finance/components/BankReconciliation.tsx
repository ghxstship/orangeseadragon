'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  RefreshCw, 
  Check, 
  X, 
  HelpCircle, 
  Plus,
  Search,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';

interface BankTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  categorySuggestion?: string;
  matchStatus: 'unmatched' | 'suggested' | 'confirmed' | 'excluded';
  matchConfidence?: number;
  suggestedMatch?: {
    id: string;
    type: 'expense' | 'payment';
    description: string;
    amount: number;
  };
}

interface BankConnection {
  id: string;
  institutionName: string;
  accountName: string;
  accountMask: string;
  balance: number;
  lastSyncAt: Date;
  unmatchedCount: number;
}

interface BankReconciliationProps {
  connection: BankConnection;
  transactions: BankTransaction[];
  onSync: () => Promise<void>;
  onConfirmMatch: (transactionId: string, matchId: string) => Promise<void>;
  onRejectMatch: (transactionId: string) => Promise<void>;
  onCreateExpense: (transactionId: string) => Promise<void>;
  onExclude: (transactionId: string) => Promise<void>;
}

export function BankReconciliation({
  connection,
  transactions,
  onSync,
  onConfirmMatch,
  onRejectMatch,
  onCreateExpense,
  onExclude,
}: BankReconciliationProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('unmatched');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAction = async (action: () => Promise<void>, transactionId: string) => {
    setProcessingId(transactionId);
    try {
      await action();
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'unmatched' && tx.matchStatus === 'unmatched') ||
      (activeTab === 'suggested' && tx.matchStatus === 'suggested') ||
      (activeTab === 'matched' && tx.matchStatus === 'confirmed');
    return matchesSearch && matchesTab;
  });

  const getStatusIcon = (status: BankTransaction['matchStatus']) => {
    switch (status) {
      case 'confirmed':
        return <Check className="h-4 w-4 text-semantic-success" />;
      case 'suggested':
        return <HelpCircle className="h-4 w-4 text-semantic-warning" />;
      case 'excluded':
        return <X className="h-4 w-4 text-muted-foreground" />;
      default:
        return <AlertCircle className="h-4 w-4 text-semantic-orange" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>{connection.accountName}</CardTitle>
              <CardDescription>
                {connection.institutionName} ****{connection.accountMask}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatCurrency(connection.balance)}
              </p>
              <p className="text-sm text-muted-foreground">
                Last synced: {format(connection.lastSyncAt, 'MMM d, h:mm a')}
              </p>
            </div>
            <Button onClick={handleSync} disabled={isSyncing} variant="outline">
              <RefreshCw className={cn('mr-2 h-4 w-4', isSyncing && 'animate-spin')} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {connection.unmatchedCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-semantic-warning/30 bg-semantic-warning/10 p-3 text-semantic-warning">
              <AlertCircle className="h-5 w-5" />
              <span>{connection.unmatchedCount} transactions need review</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction Reconciliation</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="unmatched">
                Unmatched
                <Badge variant="secondary" className="ml-2">
                  {transactions.filter((t) => t.matchStatus === 'unmatched').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="suggested">
                Suggested
                <Badge variant="secondary" className="ml-2">
                  {transactions.filter((t) => t.matchStatus === 'suggested').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="matched">Matched</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    No transactions to display
                  </div>
                ) : (
                  filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={cn(
                        'flex items-center gap-4 rounded-lg border p-4',
                        tx.matchStatus === 'suggested' && 'border-semantic-warning/30 bg-semantic-warning/10',
                        tx.matchStatus === 'confirmed' && 'border-semantic-success/30 bg-semantic-success/10'
                      )}
                    >
                      <div className="flex-shrink-0">
                        {getStatusIcon(tx.matchStatus)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{tx.description}</p>
                          {tx.categorySuggestion && (
                            <Badge variant="outline" className="text-xs">
                              {tx.categorySuggestion}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(tx.date, 'MMM d, yyyy')}
                        </p>
                      </div>

                      <div className={cn(
                        'text-right font-mono font-medium',
                        tx.type === 'credit' ? 'text-semantic-success' : 'text-destructive'
                      )}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                      </div>

                      {tx.matchStatus === 'suggested' && tx.suggestedMatch && (
                        <>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div className="min-w-0 flex-1 rounded-lg border border-border bg-card/80 p-2">
                            <p className="text-sm font-medium">{tx.suggestedMatch.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {tx.suggestedMatch.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatCurrency(tx.suggestedMatch.amount)}
                              </span>
                              {tx.matchConfidence && (
                                <span className="text-xs text-muted-foreground">
                                  {Math.round(tx.matchConfidence * 100)}% match
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex gap-2">
                        {tx.matchStatus === 'suggested' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(() => onRejectMatch(tx.id), tx.id)}
                              disabled={processingId === tx.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAction(() => onConfirmMatch(tx.id, tx.suggestedMatch!.id), tx.id)}
                              disabled={processingId === tx.id}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Confirm
                            </Button>
                          </>
                        )}
                        {tx.matchStatus === 'unmatched' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(() => onExclude(tx.id), tx.id)}
                              disabled={processingId === tx.id}
                            >
                              Exclude
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAction(() => onCreateExpense(tx.id), tx.id)}
                              disabled={processingId === tx.id}
                            >
                              <Plus className="mr-1 h-4 w-4" />
                              Create Expense
                            </Button>
                          </>
                        )}
                        {tx.matchStatus === 'confirmed' && (
                          <Badge variant="outline" className="border-semantic-success/30 bg-semantic-success/10 text-semantic-success">
                            <Check className="mr-1 h-3 w-3" />
                            Matched
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
