import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/auth/use-supabase';
import { useEvents } from '@/hooks/data/production/use-events';

interface ActiveEventsWidgetProps {
  title?: string;
  limit?: number;
}

export function ActiveEventsWidget({ title = "Active Events", limit = 5 }: ActiveEventsWidgetProps) {
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const { data: events } = useEvents(organizationId);

  const now = new Date();
  const activeEvents = (events ?? [])
    .filter((e) => e.status === 'active' || e.status === 'in_progress')
    .map((e) => {
      const startDate = new Date(e.start_date);
      const endDate = e.end_date ? new Date(e.end_date) : startDate;
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { id: e.id, name: e.name, status: e.status ?? 'active', start_date: e.start_date, days_remaining: daysRemaining };
    })
    .slice(0, limit);

  if (!activeEvents.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active events found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{event.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {event.days_remaining > 0
                    ? `${event.days_remaining} days remaining`
                    : `${Math.abs(event.days_remaining)} days ago`
                  }
                </p>
              </div>
              <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                {event.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
