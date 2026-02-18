'use client';

import { useState, type ComponentProps } from 'react';
import { useCrud } from '@/lib/crud/hooks/useCrud';
import { peopleSchema } from '@/lib/schemas/people/people';
import type { EntityRecord, EntitySchema } from '@/lib/schema-engine/types';
import { HolographicDirectory } from '@/components/people/HolographicDirectory';
import { LifeStreamProfile } from '@/components/people/LifeStreamProfile';
import { PageShell } from '@/components/common/page-shell';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

interface PersonListItem extends EntityRecord {
  headline?: string;
  location?: string;
  is_available_for_hire?: boolean;
}

type DirectoryPerson = ComponentProps<typeof HolographicDirectory>['people'][number];

export default function RostersPage() {
  const { data: people, loading } = useCrud<PersonListItem>(peopleSchema as EntitySchema<PersonListItem>);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // In a real app, we might want to fetch the single record detail here when selected
  // For now, we find from the list or just pass the ID to LifeStreamProfile if it fetches itself
  // But LifeStreamProfile currently expects a 'person' object.
  const selectedPerson = people.find((p: PersonListItem) => p.id === selectedPersonId);
  const directoryPeople: DirectoryPerson[] = people.map((p: PersonListItem): DirectoryPerson => ({
    id: p.id,
    headline: p.headline || 'Untitled Staff',
    location: p.location ?? undefined,
    status: p.is_available_for_hire ? 'online' : 'offline',
    is_available_for_hire: Boolean(p.is_available_for_hire),
    avatar_url: typeof p.avatar_url === 'string' ? p.avatar_url : undefined,
    department: typeof p.department === 'string' ? p.department : undefined,
  }));

  return (
    <PageShell
      title="Live Roster"
      description="Real-time workforce directory"
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : people.length === 0 ? (
        <ContextualEmptyState
          type="no-data"
          title="No roster members yet"
          description="Add team members to build a live roster."
        />
      ) : (
        <HolographicDirectory
          people={directoryPeople}
          onSelectPerson={setSelectedPersonId}
        />
      )}

      <Sheet open={!!selectedPersonId} onOpenChange={(open) => !open && setSelectedPersonId(null)}>
        <SheetContent side="right" className="w-[90%] sm:w-[600px] xl:w-[800px] overflow-y-auto p-0">
          {selectedPerson && (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b">
                <SheetHeader>
                  <SheetTitle className="text-2xl">{selectedPerson.headline}</SheetTitle>
                  <SheetDescription>{selectedPerson.location || 'No location set'}</SheetDescription>
                </SheetHeader>
              </div>
              <div className="flex-grow p-6">
                <LifeStreamProfile person={selectedPerson} />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
