'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrudList } from '@/lib/crud/components/CrudList';
import { leaveRequestSchema } from '@/lib/schemas/leaveRequest';
import { LeaveCalendar } from '@/components/people/LeaveCalendar';
import { LeaveRequestForm } from '@/components/people/LeaveRequestForm';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Leave Management</h2>
          <p className="text-muted-foreground">Request time off and view team availability</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="bg-zinc-800/50">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="requests">All Requests</TabsTrigger>
          <TabsTrigger value="balances">My Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <LeaveCalendar 
            onNewRequest={() => setShowRequestForm(true)}
            onRequestClick={(req) => console.log('View request:', req)}
            onDateClick={(date) => console.log('Date clicked:', date)}
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <CrudList schema={leaveRequestSchema} />
        </TabsContent>

        <TabsContent value="balances" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-300/70">Annual Leave</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">12 days</p>
              <p className="text-xs text-zinc-500 mt-2">of 20 days remaining</p>
            </div>
            <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-sm text-rose-300/70">Sick Leave</p>
              <p className="text-3xl font-bold text-rose-400 mt-1">8 days</p>
              <p className="text-xs text-zinc-500 mt-2">of 10 days remaining</p>
            </div>
            <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-300/70">Personal Days</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">2 days</p>
              <p className="text-xs text-zinc-500 mt-2">of 3 days remaining</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="max-w-2xl bg-zinc-900 border-white/10">
          <LeaveRequestForm 
            onSubmit={(data) => {
              console.log('Submit leave request:', data);
              setShowRequestForm(false);
            }}
            onCancel={() => setShowRequestForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
