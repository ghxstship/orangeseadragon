'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/common/page-shell';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';
import { formatCurrency } from '@/lib/utils';
import { captureError } from '@/lib/observability';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Layers,
  Search,
  Filter,
  RefreshCw,
  Package,
} from 'lucide-react';

interface Allotment {
  id: string;
  advance_id: string;
  advance_code: string;
  item_name: string;
  category: string;
  quantity_allotted: number;
  quantity_fulfilled: number;
  budget_allotted: number;
  budget_spent: number;
  status: 'pending' | 'partial' | 'fulfilled' | 'over_allocated';
  assigned_event: string;
}

const statusVariant: Record<string, 'secondary' | 'warning' | 'success' | 'destructive'> = {
  pending: 'secondary',
  partial: 'warning',
  fulfilled: 'success',
  over_allocated: 'destructive',
};

export default function AllotmentsPage() {
  const [allotments, setAllotments] = useState<Allotment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchAllotments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);

      const res = await fetch(`/api/advancing/allotments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAllotments(data.data || data.records || []);
      }
    } catch (error) {
      captureError(error, 'advancing.allotments.fetch');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter]);

  useEffect(() => {
    fetchAllotments();
  }, [fetchAllotments]);

  const totalBudget = allotments.reduce((sum, a) => sum + a.budget_allotted, 0);
  const totalSpent = allotments.reduce((sum, a) => sum + a.budget_spent, 0);
  const fulfilledCount = allotments.filter((a) => a.status === 'fulfilled').length;

  return (
    <PageShell
      title="Allotments"
      description="Allocate advance items by category, quantity & budget"
      icon={<Layers className="h-6 w-6" />}
      actions={
        <Button variant="ghost" size="icon" onClick={fetchAllotments}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      }
      underHeader={
        <div className="py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search allotments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="logistics">Logistics</SelectItem>
              <SelectItem value="hospitality">Hospitality</SelectItem>
              <SelectItem value="staffing">Staffing</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      contentClassName="space-y-6"
    >
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Allotments</div>
              <div className="text-2xl font-bold">{allotments.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {fulfilledCount} fulfilled
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Budget Allotted</div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalBudget)}
              </div>
              <Progress
                value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0}
                className="h-1.5 mt-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Budget Spent</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalSpent)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalBudget > 0
                  ? `${Math.round((totalSpent / totalBudget) * 100)}% utilised`
                  : 'No budget set'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Allotments Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : allotments.length === 0 ? (
              <ContextualEmptyState
                type="no-data"
                icon={Package}
                title="No allotments found"
                description="No allotments match your current filters."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Advance</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Qty Allotted</TableHead>
                    <TableHead className="text-right">Qty Fulfilled</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allotments.map((allotment) => (
                    <TableRow key={allotment.id}>
                      <TableCell className="font-medium">{allotment.item_name}</TableCell>
                      <TableCell className="text-muted-foreground">{allotment.advance_code}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{allotment.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{allotment.quantity_allotted}</TableCell>
                      <TableCell className="text-right">{allotment.quantity_fulfilled}</TableCell>
                      <TableCell className="text-right">{formatCurrency(allotment.budget_allotted)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(allotment.budget_spent)}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[allotment.status] || 'secondary'}>
                          {allotment.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    </PageShell>
  );
}
