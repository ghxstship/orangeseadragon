'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrudList } from '@/lib/crud/components/CrudList';
import { timesheetSchema } from '@/lib/schemas/timesheet';
import { clockEntrySchema } from '@/lib/schemas/clockEntry';
import { TimeClock } from '@/components/people/TimeClock';
import { PageShell } from '@/components/common/page-shell';
import { useUser } from '@/hooks/use-supabase';

export default function TimekeepingPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('clock');

  const handleClockIn = async (data: { timestamp: Date; location?: { lat: number; lng: number }; locationName?: string }) => {
    try {
      await fetch('/api/clock-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'clock_in',
          timestamp: data.timestamp.toISOString(),
          latitude: data.location?.lat,
          longitude: data.location?.lng,
          location_name: data.locationName,
        }),
      });
    } catch (err) {
      console.error('Clock in failed:', err);
    }
  };

  const handleClockOut = async (data: { timestamp: Date; location?: { lat: number; lng: number }; locationName?: string }) => {
    try {
      await fetch('/api/clock-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'clock_out',
          timestamp: data.timestamp.toISOString(),
          latitude: data.location?.lat,
          longitude: data.location?.lng,
          location_name: data.locationName,
        }),
      });
    } catch (err) {
      console.error('Clock out failed:', err);
    }
  };

  return (
    <PageShell
      title="Time & Attendance"
      description="Clock in/out, timesheets, and attendance tracking"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="clock">Time Clock</TabsTrigger>
          <TabsTrigger value="entries">Clock Entries</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
        </TabsList>

        <TabsContent value="clock" className="mt-6">
          <div className="max-w-md mx-auto">
            <TimeClock
              employeeName={user?.user_metadata?.full_name || 'Current User'}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
            />
          </div>
        </TabsContent>

        <TabsContent value="entries" className="mt-6">
          <CrudList schema={clockEntrySchema} />
        </TabsContent>

        <TabsContent value="timesheets" className="mt-6">
          <CrudList schema={timesheetSchema} />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
