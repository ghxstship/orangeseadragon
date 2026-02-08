'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrudList } from '@/lib/crud/components/CrudList';
import { timesheetSchema } from '@/lib/schemas/timesheet';
import { clockEntrySchema } from '@/lib/schemas/clockEntry';
import { TimeClock } from '@/components/people/TimeClock';

export default function TimekeepingPage() {
  const [activeTab, setActiveTab] = useState('clock');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Time & Attendance</h2>
          <p className="text-muted-foreground">Clock in/out, timesheets, and attendance tracking</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="bg-zinc-800/50">
          <TabsTrigger value="clock">Time Clock</TabsTrigger>
          <TabsTrigger value="entries">Clock Entries</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
        </TabsList>

        <TabsContent value="clock" className="mt-6">
          <div className="max-w-md mx-auto">
            <TimeClock 
              employeeName="Current User"
              onClockIn={(data) => console.log('Clock in:', data)}
              onClockOut={(data) => console.log('Clock out:', data)}
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
    </div>
  );
}
