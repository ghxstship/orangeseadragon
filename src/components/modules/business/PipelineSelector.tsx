'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Pipeline {
    id: string;
    name: string;
    description?: string;
    pipeline_type: string;
    is_default: boolean;
    is_active: boolean;
    deal_count?: number;
}

interface PipelineSelectorProps {
    selectedPipelineId?: string;
    onPipelineChange: (pipelineId: string) => void;
    onCreatePipeline?: () => void;
    onManagePipelines?: () => void;
    showActions?: boolean;
}

export function PipelineSelector({
    selectedPipelineId,
    onPipelineChange,
    onCreatePipeline,
    onManagePipelines,
    showActions = true,
}: PipelineSelectorProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['pipelines'],
        queryFn: async () => {
            const res = await fetch('/api/pipelines?is_active=true');
            if (!res.ok) throw new Error('Failed to load pipelines');
            return res.json();
        },
    });

    const pipelines: Pipeline[] = data?.records || [];

    // Auto-select default pipeline if none selected
    React.useEffect(() => {
        if (!selectedPipelineId && pipelines.length > 0) {
            const defaultPipeline = pipelines.find(p => p.is_default) || pipelines[0];
            if (defaultPipeline) {
                onPipelineChange(defaultPipeline.id);
            }
        }
    }, [pipelines, selectedPipelineId, onPipelineChange]);

    if (isLoading) {
        return <Skeleton className="h-9 w-48" />;
    }

    if (pipelines.length === 0) {
        return (
            <Button variant="outline" size="sm" onClick={onCreatePipeline}>
                <Plus className="h-4 w-4 mr-2" />
                Create Pipeline
            </Button>
        );
    }

    // If only one pipeline, show it as a label instead of dropdown
    if (pipelines.length === 1) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{pipelines[0].name}</span>
                {showActions && onManagePipelines && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onManagePipelines}>
                        <Settings className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Select value={selectedPipelineId} onValueChange={onPipelineChange}>
                <SelectTrigger className="w-48 h-9">
                    <SelectValue placeholder="Select pipeline" />
                </SelectTrigger>
                <SelectContent>
                    {pipelines.map(pipeline => (
                        <SelectItem key={pipeline.id} value={pipeline.id}>
                            <div className="flex items-center justify-between w-full">
                                <span>{pipeline.name}</span>
                                {pipeline.deal_count !== undefined && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                        ({pipeline.deal_count})
                                    </span>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {showActions && (
                <div className="flex items-center gap-1">
                    {onCreatePipeline && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCreatePipeline}>
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    )}
                    {onManagePipelines && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onManagePipelines}>
                            <Settings className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default PipelineSelector;
