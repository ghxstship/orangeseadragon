import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusSolidClass } from '@/lib/tokens/semantic-colors';
import { useUser } from '@/hooks/use-supabase';
import { useShifts } from '@/hooks/use-shifts';

interface CrewStatusWidgetProps {
  title?: string;
  limit?: number;
}

export function CrewStatusWidget({ title = "Crew Status", limit = 5 }: CrewStatusWidgetProps) {
  const { user } = useUser();
  const organizationId = user?.user_metadata?.organization_id || null;
  const { data: shifts } = useShifts(organizationId);

  const today = new Date().toISOString().split('T')[0];
  const crewMembers = (shifts ?? [])
    .filter((s) => s.date === today || s.scheduled_start?.startsWith(today))
    .map((s) => ({
      id: s.id,
      name: s.user_name ?? 'Unassigned',
      status: s.status ?? 'scheduled',
      role: s.event_name ?? 'Crew',
    }))
    .slice(0, limit);

  if (!crewMembers.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No crew members found.</p>
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
          {crewMembers.map((crew) => (
            <div key={crew.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{crew.name}</h4>
                <p className="text-sm text-muted-foreground">{crew.role}</p>
              </div>
              <Badge variant="outline" className="flex items-center space-x-1">
                <div className={`h-2 w-2 rounded-full ${getStatusSolidClass(crew.status)}`} />
                <span>{crew.status.replace('_', ' ')}</span>
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
