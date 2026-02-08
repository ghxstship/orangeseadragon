import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CrewStatusWidgetProps {
  title?: string;
  limit?: number;
}

export function CrewStatusWidget({ title = "Crew Status", limit = 5 }: CrewStatusWidgetProps) {
  // Mock data for now - in real app would use crew/assignment hooks
  const mockCrew = [
    { id: 1, name: 'John Smith', status: 'checked_in', role: 'Lighting Tech' },
    { id: 2, name: 'Sarah Johnson', status: 'checked_out', role: 'Audio Engineer' },
    { id: 3, name: 'Mike Davis', status: 'scheduled', role: 'Stage Manager' },
  ];

  const crewMembers = mockCrew.slice(0, limit);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in': return 'bg-green-500';
      case 'checked_out': return 'bg-red-500';
      case 'scheduled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

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
                <div className={`h-2 w-2 rounded-full ${getStatusColor(crew.status)}`} />
                <span>{crew.status.replace('_', ' ')}</span>
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
