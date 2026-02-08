import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TodayScheduleWidgetProps {
  title?: string;
  limit?: number;
}

export function TodayScheduleWidget({ title = "Today's Schedule", limit = 5 }: TodayScheduleWidgetProps) {
  // Mock data for now - in real app would use schedule/events hooks
  const mockSchedule = [
    { id: 1, time: '09:00', event: 'Load-in begins', location: 'Venue A' },
    { id: 2, time: '13:00', event: 'Tech rehearsal', location: 'Stage' },
    { id: 3, time: '18:00', event: 'Show time', location: 'Main Stage' },
  ];

  const todayEvents = mockSchedule.slice(0, limit);

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
