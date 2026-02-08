'use client';

import { useState } from 'react';
import { useCrud } from '@/lib/crud/hooks/useCrud';
import { peopleSchema } from '@/lib/schemas/people';
import { HolographicDirectory } from '@/components/people/HolographicDirectory';
import { LifeStreamProfile } from '@/components/people/LifeStreamProfile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';

export default function RostersPage() {
  const { data: people, loading } = useCrud(peopleSchema);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // In a real app, we might want to fetch the single record detail here when selected
  // For now, we find from the list or just pass the ID to LifeStreamProfile if it fetches itself
  // But LifeStreamProfile currently expects a 'person' object.
  const selectedPerson = people.find((p: any) => p.id === selectedPersonId);

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Roster</h2>
          <p className="text-muted-foreground">Real-time workforce directory</p>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <HolographicDirectory
          people={people.map((p: any) => ({
            ...p,
            // Map schema fields to component props if needed, or ensure schema matches
            status: p.is_available_for_hire ? 'online' : 'offline', // Simple mapping for now
            headline: p.headline || 'Untitled Staff'
          }))}
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
      </div>
    </div>
  );
}
