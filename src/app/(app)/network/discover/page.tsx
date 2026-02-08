'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Users, Briefcase, MapPin } from 'lucide-react';

interface ConnectionSuggestion {
  id: string;
  name: string;
  headline: string;
  company: string;
  location: string;
  avatar?: string;
  mutualConnections: number;
  reason: string;
}

const mockSuggestions: ConnectionSuggestion[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    headline: 'Production Manager',
    company: 'Live Events Co',
    location: 'Los Angeles, CA',
    mutualConnections: 12,
    reason: 'Same industry',
  },
  {
    id: '2',
    name: 'Michael Chen',
    headline: 'Technical Director',
    company: 'Stage Systems Inc',
    location: 'New York, NY',
    mutualConnections: 8,
    reason: '8 mutual connections',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    headline: 'Event Coordinator',
    company: 'Festival Productions',
    location: 'Austin, TX',
    mutualConnections: 5,
    reason: 'Attended same event',
  },
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions] = useState<ConnectionSuggestion[]>(mockSuggestions);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.headline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discover People</h1>
          <p className="text-muted-foreground">
            Find and connect with professionals in your network
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSuggestions.map((suggestion) => (
          <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={suggestion.avatar} />
                  <AvatarFallback>
                    {suggestion.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{suggestion.name}</CardTitle>
                  <CardDescription className="truncate">{suggestion.headline}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span className="truncate">{suggestion.company}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{suggestion.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{suggestion.mutualConnections} mutual connections</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {suggestion.reason}
              </Badge>
              <Button className="w-full" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuggestions.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search to find more people
          </p>
        </div>
      )}
    </div>
  );
}
