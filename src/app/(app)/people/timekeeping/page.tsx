'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrudList } from '@/lib/crud/components/CrudList';
import { timesheetSchema } from '@/lib/schemas/timesheet';
import { clockEntrySchema } from '@/lib/schemas/clockEntry';
import { TimeClock } from '@/components/people/TimeClock';
import { PageShell } from '@/components/common/page-shell';

export default function TimekeepingPage() {
  const [activeTab, setActiveTab] = useState('clock');

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
              employeeName="Current User"
              onClockIn={() => { /* TODO: implement clock in */ }}
              onClockOut={() => { /* TODO: implement clock out */ }}
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
