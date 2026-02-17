'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/common/page-shell';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';
import { captureError } from '@/lib/observability';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Link2,
  Search,
  Filter,
  RefreshCw,
  Users,
  Building2,
  User,
  Package,
  Plus,
} from 'lucide-react';

interface Assignment {
  id: string;
  asset_id: string;
  asset_name: string;
  asset_category: string;
  assignee_type: 'user' | 'team' | 'company';
  assignee_id: string;
  assignee_name: string;
  advance_code?: string;
  event_name?: string;
  status: 'active' | 'returned' | 'pending_return' | 'lost' | 'damaged';
  assigned_at: string;
  due_back_at?: string;
  returned_at?: string;
  notes?: string;
}

const statusVariant: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  active: 'success',
  returned: 'secondary',
  pending_return: 'warning',
  lost: 'destructive',
  damaged: 'destructive',
};

const assigneeIcon: Record<string, React.ElementType> = {
  user: User,
  team: Users,
  company: Building2,
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (typeFilter !== 'all') params.set('assignee_type', typeFilter);

      const res = await fetch(`/api/advancing/assignments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.data || data.records || []);
      }
    } catch (error) {
      captureError(error, 'advancing.assignments.fetch');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, typeFilter]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const active = assignments.filter((a) => a.status === 'active' || a.status === 'pending_return');
  const returned = assignments.filter((a) => a.status === 'returned');
  const flagged = assignments.filter((a) => a.status === 'lost' || a.status === 'damaged');

  const currentList =
    activeTab === 'active' ? active : activeTab === 'returned' ? returned : flagged;

  const renderRow = (assignment: Assignment) => {
    const Icon = assigneeIcon[assignment.assignee_type] || User;
    return (
      <TableRow key={assignment.id}>
        <TableCell>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">{assignment.asset_name}</div>
              <div className="text-xs text-muted-foreground">{assignment.asset_category}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                <Icon className="h-3.5 w-3.5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm">{assignment.assignee_name}</div>
              <div className="text-xs text-muted-foreground capitalize">{assignment.assignee_type}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {assignment.advance_code || '—'}
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {assignment.event_name || '—'}
        </TableCell>
        <TableCell className="text-sm">
          {new Date(assignment.assigned_at).toLocaleDateString()}
        </TableCell>
        <TableCell className="text-sm">
          {assignment.due_back_at
            ? new Date(assignment.due_back_at).toLocaleDateString()
            : '—'}
        </TableCell>
        <TableCell>
          <Badge variant={statusVariant[assignment.status] || 'secondary'}>
            {assignment.status.replace('_', ' ')}
          </Badge>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <PageShell
      title="Assignments"
      description="Link inventory items to users, teams & companies"
      icon={<Link2 className="h-6 w-6" />}
      actions={
        <div className="flex items-center gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Assign Item
          </Button>
          <Button variant="ghost" size="icon" onClick={fetchAssignments}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      }
      underHeader={
        <div className="py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Assignee Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="user">Users</SelectItem>
              <SelectItem value="team">Teams</SelectItem>
              <SelectItem value="company">Companies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      contentClassName="space-y-4"
    >

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="underline">
            <TabsTrigger value="active">
              Active ({active.length})
            </TabsTrigger>
            <TabsTrigger value="returned">
              Returned ({returned.length})
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged ({flagged.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : currentList.length === 0 ? (
                  <ContextualEmptyState
                    type="no-data"
                    icon={Link2}
                    title={activeTab === 'active' ? 'No active assignments' : activeTab === 'returned' ? 'No returned assignments' : 'No flagged assignments'}
                    description="Assignments will appear here once inventory is linked to assignees."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Advance</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Assigned</TableHead>
                        <TableHead>Due Back</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{currentList.map(renderRow)}</TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </PageShell>
  );
}
