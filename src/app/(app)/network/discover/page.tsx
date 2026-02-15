'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Users, Briefcase, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-supabase';

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

export default function DiscoverPage() {
  const { user } = useUser();
  const orgId = user?.user_metadata?.organization_id || null;
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<ConnectionSuggestion[]>([]);

  useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();

    const fetchContacts = async () => {
      const { data } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, full_name, job_title, company_id, city, state, country, avatar_url, department')
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch company names
      const companyIds = Array.from(new Set((data ?? []).map(c => c.company_id).filter(Boolean))) as string[];
      const { data: companies } = companyIds.length > 0
        ? await supabase.from('companies').select('id, name').in('id', companyIds)
        : { data: [] };
      const companyMap = new Map((companies ?? []).map(c => [c.id, c.name]));

      const mapped: ConnectionSuggestion[] = (data ?? []).map((c) => {
        const name = c.full_name ?? `${c.first_name} ${c.last_name}`;
        const location = [c.city, c.state, c.country].filter(Boolean).join(', ');
        return {
          id: c.id,
          name,
          headline: c.job_title ?? c.department ?? '',
          company: c.company_id ? (companyMap.get(c.company_id) ?? '') : '',
          location,
          avatar: c.avatar_url ?? undefined,
          mutualConnections: 0,
          reason: c.department ? `${c.department} department` : 'Contact',
        };
      });

      setContacts(mapped);
    };

    fetchContacts();
  }, [orgId]);

  const filteredSuggestions = useMemo(() => contacts.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.headline.toLowerCase().includes(searchQuery.toLowerCase())
  ), [contacts, searchQuery]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discover People</h1>
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
