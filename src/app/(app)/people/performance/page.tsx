'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrudList } from '@/lib/crud/components/CrudList';
import { performanceReviewSchema } from '@/lib/schemas/performanceReview';
import { PerformanceReviewDashboard } from '@/components/people/PerformanceReviewDashboard';

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Management</h2>
          <p className="text-muted-foreground">Reviews, goals, and continuous feedback</p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-auto px-6 pt-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reviews">All Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <PerformanceReviewDashboard 
            onStartReview={(id) => console.log('Start review:', id)}
            onViewReview={(id) => console.log('View review:', id)}
          />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <CrudList schema={performanceReviewSchema} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
