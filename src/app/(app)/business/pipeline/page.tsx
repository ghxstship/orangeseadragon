'use client';

import { useState } from 'react';
import { PipelineBoard } from '@/components/modules/business/PipelineBoard';
import { PipelineSelector } from '@/components/modules/business/PipelineSelector';
import { Button } from '@/components/ui/button';
import { Filter, LayoutGrid, List } from 'lucide-react';

export default function PipelinePage() {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Pipeline</h2>
          <PipelineSelector
            selectedPipelineId={selectedPipelineId}
            onPipelineChange={setSelectedPipelineId}
            showActions={true}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-r-none"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 rounded-l-none"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-4 bg-muted/10">
        <PipelineBoard pipelineId={selectedPipelineId} />
      </div>
    </div>
  );
}
