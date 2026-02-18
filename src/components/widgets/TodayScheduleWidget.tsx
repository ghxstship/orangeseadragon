import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/auth/use-supabase';
import { useCalendarEvents } from '@/hooks/data/operations/use-calendar-events';

interface TodayScheduleWidgetProps {
  title?: string;
  limit?: number;
}

export function TodayScheduleWidget({ title = "Today's Schedule", limit = 5 }: TodayScheduleWidgetProps) {
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
  const { data: calendarEvents } = useCalendarEvents(organizationId, startOfDay, endOfDay);

  const todayEvents = (calendarEvents ?? [])
    .map((e) => ({
      id: e.id,
      time: e.start_time ? new Date(e.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'All day',
      event: e.title,
      location: e.location ?? '',
    }))
    .slice(0, limit);

  if (!todayEvents.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No events scheduled for today.</p>
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
          {todayEvents.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="font-mono">
                  {event.time}
                </Badge>
                <div>
                  <h4 className="font-medium">{event.event}</h4>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
