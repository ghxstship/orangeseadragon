import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-supabase';
import { useOrganization } from '@/hooks/use-organization';

interface ActiveEventsWidgetProps {
  title?: string;
  limit?: number;
}

export function ActiveEventsWidget({ title = "Active Events", limit = 5 }: ActiveEventsWidgetProps) {
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const { data: organization } = useOrganization(organizationId);

  // Mock data for now - in real app would use events hook
  const mockEvents = [
    { id: 1, name: 'Summer Music Festival', status: 'active', start_date: '2024-07-15', days_remaining: 3 },
    { id: 2, name: 'Corporate Conference', status: 'planning', start_date: '2024-08-01', days_remaining: 17 },
    { id: 3, name: 'Wedding Reception', status: 'setup', start_date: '2024-06-20', days_remaining: -5 },
  ];

  const activeEvents = mockEvents
    .filter(event => event.status === 'active')
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
