'use client';

import React, { useMemo, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';

import { useCrud } from '@/lib/crud/hooks/useCrud';
import type { EntityRecord, EntitySchema } from '@/lib/schema-engine/types';
import { dealSchema } from '@/lib/schemas/crm/deal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DEFAULT_LOCALE } from '@/lib/config';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Types ---
interface Deal extends EntityRecord {
    stage?: string;
    name?: string;
    companyId?: string;
    value?: number | string;
    probability?: number;
    closeDate?: string;
    lastActivityAt?: string;
    last_activity_at?: string;
}

interface PipelineStageOption {
    label: string;
    value: string;
    color?: string;
}

// --- Utilities ---
const currencyFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

const DEFAULT_ROTTING_DAYS = 7;

function getDaysSinceActivity(lastActivityAt: string | Date | null | undefined): number {
    if (!lastActivityAt) return Infinity;
    const lastActivity = new Date(lastActivityAt);
    const now = new Date();
    const diffMs = now.getTime() - lastActivity.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function isDeadRotting(deal: Deal, rottingDays: number = DEFAULT_ROTTING_DAYS): boolean {
    if (deal.stage === 'closed-won' || deal.stage === 'closed-lost') return false;
    const daysSince = getDaysSinceActivity(deal.lastActivityAt || deal.last_activity_at);
    return daysSince > rottingDays;
}

// --- Components ---

function SortableDealCard({ deal, isOverlay }: { deal: Deal; isOverlay?: boolean }) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: deal.id,
        data: {
            type: 'Deal',
            deal,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const variants = {
        prospecting: 'border-l-muted-foreground',
        qualification: 'border-l-semantic-info',
        proposal: 'border-l-semantic-warning',
        negotiation: 'border-l-semantic-orange',
        'closed-won': 'border-l-semantic-success',
        'closed-lost': 'border-l-destructive',
    };

    const isRotting = isDeadRotting(deal);
    const daysSinceActivity = getDaysSinceActivity(deal.lastActivityAt || deal.last_activity_at);

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "mb-3 cursor-grab hover:shadow-md transition-all border-l-4",
                variants[deal.stage as keyof typeof variants] || 'border-l-border',
                isDragging && "opacity-30",
                isOverlay && "shadow-xl rotate-2 cursor-grabbing opacity-90 scale-105 z-50 ring-2 ring-primary",
                isRotting && "ring-2 ring-destructive/50 bg-destructive/5/30 dark:bg-destructive/90/20"
            )}
        >
            <CardContent className="p-3">
                {isRotting && (
                    <div className="flex items-center gap-1.5 mb-2 text-destructive dark:text-destructive/80">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[10px] font-semibold uppercase tracking-wider">
                            {daysSinceActivity === Infinity ? 'No activity' : `${daysSinceActivity}d idle`}
                        </span>
                    </div>
                )}
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {deal.companyId || 'Unknown Co.'}
                    </span>
                    {deal.probability && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1">
                            {deal.probability}%
                        </Badge>
                    )}
                </div>
                <h4 className="font-medium text-sm mb-1 line-clamp-2">{deal.name}</h4>
                <div className="flex justify-between items-center mt-3">
                    <span className="font-bold text-sm">
                        {currencyFormatter.format(Number(deal.value) || 0)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'No date'}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

function PipelineColumn({
    id,
    title,
    deals,
    color
}: {
    id: string,
    title: string,
    deals: Deal[],
    color: string
}) {
    const { setNodeRef } = useSortable({
        id: id,
        data: {
            type: 'Column',
            columnId: id,
        },
        disabled: true, // Columns aren't draggable themselves in this version
    });

    const totalValue = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

    return (
        <div ref={setNodeRef} className="flex flex-col h-full min-w-[280px] max-w-[320px] rounded-lg bg-muted/30 border border-border/50">
            <div className={cn("p-3 border-b flex justify-between items-center bg-muted/40 rounded-t-lg")}>
                <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", color)} />
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <Badge variant="outline" className="text-[10px] h-5 bg-background">{deals.length}</Badge>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                    {currencyFormatter.format(totalValue)}
                </span>
            </div>

            <ScrollArea className="flex-1 p-2">
                <div className="flex flex-col min-h-[150px]">
                    <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                        {deals.map((deal) => (
                            <SortableDealCard key={deal.id} deal={deal} />
                        ))}
                    </SortableContext>
                </div>
            </ScrollArea>
        </div>
    );
}

interface PipelineBoardProps {
    pipelineId?: string;
}

export function PipelineBoard({ pipelineId }: PipelineBoardProps) {
    const { data: deals, update, loading } = useCrud<Deal>(dealSchema as EntitySchema<Deal>, {
        query: pipelineId ? { where: { pipeline_id: pipelineId } } : undefined,
    });
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

    // Define columns based on schema options
    const columns = useMemo<PipelineStageOption[]>(() => {
        const rawOptions = dealSchema.data.fields.stage?.options;
        // Handle the case where options might be a function or undefined, though we know it's an array for deals
        if (Array.isArray(rawOptions)) {
            return rawOptions as PipelineStageOption[];
        }
        return [];
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Group deals by stage
    const dealsByStage = useMemo(() => {
        const groups: Record<string, Deal[]> = {};
        columns.forEach((col) => { groups[col.value] = [] });

        if (Array.isArray(deals)) {
            deals.forEach((deal) => {
                const stage = deal.stage || columns[0]?.value;
                if (stage && groups[stage]) {
                    groups[stage]!.push(deal);
                } else {
                    // Handle unknown stages by putting in first col or 'prospecting'
                    if (!groups['prospecting']) groups['prospecting'] = [];
                    groups['prospecting']!.push(deal);
                }
            });
        }
        return groups;
    }, [deals, columns]);

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Deal') {
            setActiveDeal(event.active.data.current.deal);
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDeal(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find the container (column) we dropped into
        // If over a deal, find that deal's stage. If over a column, use column id.

        let newStage = '';

        // Check if we dropped directly on a column
        const overColumn = columns.find((c) => c.value === overId);
        if (overColumn) {
            newStage = overColumn.value;
        } else {
            // We dropped on a card, find its deal to get the stage
            const overDeal = deals.find((d: Deal) => d.id === overId);
            if (overDeal) {
                newStage = overDeal.stage ?? '';
            }
        }

        if (newStage && activeDeal && activeDeal.stage !== newStage) {
            // Update the deal stage
            update(String(activeId), { stage: newStage });
        }
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    const getColorForStage = (stage: string) => {
        const option = columns.find((c) => c.value === stage);
        const colorMap: Record<string, string> = {
            gray: 'bg-muted-foreground',
            blue: 'bg-semantic-info',
            yellow: 'bg-semantic-warning',
            orange: 'bg-semantic-orange',
            green: 'bg-semantic-success',
            red: 'bg-destructive'
        };
        return colorMap[option?.color || 'gray'] || 'bg-muted-foreground';
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center p-10"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="flex min-h-[400px] max-h-[calc(100vh-140px)] gap-4 overflow-x-auto pb-4 px-1">
                {columns.map((col) => (
                    <PipelineColumn
                        key={col.value}
                        id={col.value}
                        title={col.label}
                        deals={dealsByStage[col.value] || []}
                        color={getColorForStage(col.value)}
                    />
                ))}
            </div>

            {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeDeal ? (
                        <SortableDealCard deal={activeDeal} isOverlay />
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
