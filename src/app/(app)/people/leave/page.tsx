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
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Leave Management</h2>
          <p className="text-muted-foreground">Request time off and view team availability</p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-auto px-6 pt-6">
        <TabsList>
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
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground">Annual Leave</p>
              <p className="text-3xl font-bold text-primary mt-1">12 days</p>
              <p className="text-xs text-muted-foreground mt-2">of 20 days remaining</p>
            </div>
            <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-muted-foreground">Sick Leave</p>
              <p className="text-3xl font-bold text-destructive mt-1">8 days</p>
              <p className="text-xs text-muted-foreground mt-2">of 10 days remaining</p>
            </div>
            <div className="p-6 rounded-xl bg-accent border">
              <p className="text-sm text-muted-foreground">Personal Days</p>
              <p className="text-3xl font-bold mt-1">2 days</p>
              <p className="text-xs text-muted-foreground mt-2">of 3 days remaining</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="max-w-2xl">
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
