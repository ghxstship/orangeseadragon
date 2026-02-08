'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrudList } from '@/lib/crud/components/CrudList';
import { performanceReviewSchema } from '@/lib/schemas/performanceReview';
import { PerformanceReviewDashboard } from '@/components/people/PerformanceReviewDashboard';

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Performance Management</h2>
          <p className="text-muted-foreground">Reviews, goals, and continuous feedback</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="bg-zinc-800/50">
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
