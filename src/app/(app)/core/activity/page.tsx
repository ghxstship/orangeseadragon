'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, RefreshCw, FileText, CheckSquare, Calendar, Users, FolderKanban, Activity } from 'lucide-react';
import { useAuditLogs } from '@/hooks/use-audit-logs';

const activityTypes = [
  { value: 'all', label: 'All Activity' },
  { value: 'tasks', label: 'Tasks' },
  { value: 'projects', label: 'Projects' },
  { value: 'documents', label: 'Documents' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'team', label: 'Team' },
];

const getIconForCategory = (category: string) => {
  switch (category) {
    case 'task': return CheckSquare;
    case 'document': return FileText;
    case 'calendar': return Calendar;
    case 'project': return FolderKanban;
    case 'team': return Users;
    default: return Activity;
  }
};

export default function ActivityPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { logs, loading, refetch } = useAuditLogs({ limit: 50 });

  const handleRefresh = async () => {
    await refetch();
  };

  const activities = logs.map((log) => ({
    id: log.id,
    type: log.category,
    action: log.action,
    title: log.description,
    project: log.target?.name || null,
    user: { name: log.actor.name || log.actor.email || 'Unknown', avatar: '' },
    timestamp: new Date(log.timestamp).toLocaleString(),
    icon: getIconForCategory(log.category),
  }));

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(search.toLowerCase()) ||
      (activity.project?.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'all' || activity.type === filter.slice(0, -1);
    return matchesSearch && matchesFilter;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'created': return 'bg-blue-100 text-blue-700';
      case 'updated': return 'bg-amber-100 text-amber-700';
      case 'uploaded': return 'bg-purple-100 text-purple-700';
      case 'assigned': return 'bg-orange-100 text-orange-700';
      case 'joined': return 'bg-teal-100 text-teal-700';
      case 'commented': return 'bg-gray-100 text-gray-700';
      case 'milestone': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Feed</h1>
          <p className="text-muted-foreground">Track all activity across your workspace</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search activity..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity found matching your criteria.
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {activity.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{activity.user.name}</span>
                        <Badge variant="secondary" className={getActionColor(activity.action)}>
                          {activity.action}
                        </Badge>
                      </div>
                      <p className="font-medium mt-1">{activity.title}</p>
                      {activity.project && (
                        <p className="text-sm text-muted-foreground">in {activity.project}</p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {activity.timestamp}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
