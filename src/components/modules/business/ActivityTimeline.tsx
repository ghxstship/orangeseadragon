'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Phone,
    Mail,
    Calendar,
    FileText,
    MessageSquare,
    CheckCircle2,
    Clock,
    ArrowRight,
    Plus,
    Filter,
    MoreHorizontal,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// --- Types ---
interface Activity {
    id: string;
    activity_type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'follow_up' | 'stage_change';
    subject: string;
    description?: string;
    occurred_at?: string;
    created_at: string;
    due_date?: string;
    completed_at?: string;
    is_completed?: boolean;
    duration_minutes?: number;
    outcome?: string;
    created_by?: {
        id: string;
        name: string;
        avatar_url?: string;
    };
    company_id?: string;
    contact_id?: string;
    deal_id?: string;
}

interface ActivityTimelineProps {
    entityType: 'contact' | 'company' | 'deal';
    entityId: string;
    maxItems?: number;
    showHeader?: boolean;
    onAddActivity?: () => void;
}

// --- Utilities ---
const activityIcons: Record<string, React.ElementType> = {
    call: Phone,
    email: Mail,
    meeting: Calendar,
    task: CheckCircle2,
    note: FileText,
    follow_up: Clock,
    stage_change: ArrowRight,
};

const activityColors: Record<string, string> = {
    call: 'bg-semantic-success',
    email: 'bg-blue-500',
    meeting: 'bg-purple-500',
    task: 'bg-orange-500',
    note: 'bg-gray-500',
    follow_up: 'bg-semantic-warning',
    stage_change: 'bg-indigo-500',
};

function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function groupActivitiesByDate(activities: Activity[]): Map<string, Activity[]> {
    const groups = new Map<string, Activity[]>();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    activities.forEach(activity => {
        const activityDate = new Date(activity.occurred_at || activity.created_at);
        const dateString = activityDate.toDateString();

        let groupKey: string;
        if (dateString === today) {
            groupKey = 'Today';
        } else if (dateString === yesterday) {
            groupKey = 'Yesterday';
        } else {
            groupKey = activityDate.toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: activityDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            });
        }

        if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(activity);
    });

    return groups;
}

// --- Components ---
function ActivityItem({ activity }: { activity: Activity }) {
    const Icon = activityIcons[activity.activity_type] || MessageSquare;
    const colorClass = activityColors[activity.activity_type] || 'bg-gray-500';
    const timestamp = activity.occurred_at || activity.created_at;

    return (
        <div className="flex gap-3 py-3 group">
            {/* Icon */}
            <div className="flex-shrink-0 relative">
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white",
                    colorClass
                )}>
                    <Icon className="w-4 h-4" />
                </div>
                {/* Connector line */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-[calc(100%-2rem)] bg-border group-last:hidden" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                            {activity.subject}
                        </p>
                        {activity.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {activity.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                            {formatTime(timestamp)}
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-2 mt-1.5">
                    {activity.duration_minutes && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            {activity.duration_minutes} min
                        </Badge>
                    )}
                    {activity.is_completed && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-semantic-success border-semantic-success/20 bg-semantic-success/10">
                            Completed
                        </Badge>
                    )}
                    {activity.created_by?.name && (
                        <span className="text-[10px] text-muted-foreground">
                            by {activity.created_by.name}
                        </span>
                    )}
                </div>

                {/* Outcome */}
                {activity.outcome && (
                    <div className="mt-2 p-2 bg-muted/50 rounded-md text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Outcome:</span> {activity.outcome}
                    </div>
                )}
            </div>
        </div>
    );
}

function DateGroup({ label, activities }: { label: string; activities: Activity[] }) {
    return (
        <div className="mb-4">
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {label}
                </span>
            </div>
            <div className="space-y-0">
                {activities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                ))}
            </div>
        </div>
    );
}

// --- Main Component ---
export function ActivityTimeline({
    entityType,
    entityId,
    maxItems = 50,
    showHeader = true,
    onAddActivity,
}: ActivityTimelineProps) {
    // Fetch activities for this entity
    const { data, isLoading, error } = useQuery({
        queryKey: ['activities', entityType, entityId],
        queryFn: async () => {
            const params = new URLSearchParams({
                [`${entityType}_id`]: entityId,
                limit: String(maxItems),
                orderBy: JSON.stringify({ field: 'occurred_at', direction: 'desc' }),
            });
            const res = await fetch(`/api/activities?${params}`);
            if (!res.ok) throw new Error('Failed to load activities');
            return res.json();
        },
    });

    const activities: Activity[] = useMemo(() => data?.records || [], [data]);

    const groupedActivities = useMemo(() => {
        return groupActivitiesByDate(activities);
    }, [activities]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>Failed to load activities</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {showHeader && (
                <div className="flex items-center justify-between pb-3 border-b mb-3">
                    <h3 className="text-sm font-semibold">Activity Timeline</h3>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Filter className="h-3.5 w-3.5 mr-1" />
                            Filter
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="h-7 px-2"
                            onClick={onAddActivity}
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add
                        </Button>
                    </div>
                </div>
            )}

            {activities.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <MessageSquare className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">No activities yet</p>
                    <p className="text-xs text-muted-foreground mb-4">
                        Log calls, emails, meetings, and notes to track your interactions
                    </p>
                    <Button variant="outline" size="sm" onClick={onAddActivity}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Log First Activity
                    </Button>
                </div>
            ) : (
                <ScrollArea className="flex-1">
                    <div className="pr-4">
                        {Array.from(groupedActivities.entries()).map(([dateLabel, dateActivities]) => (
                            <DateGroup
                                key={dateLabel}
                                label={dateLabel}
                                activities={dateActivities}
                            />
                        ))}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}

export default ActivityTimeline;
