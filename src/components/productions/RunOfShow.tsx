'use client';

import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

export interface RunOfShowItem {
    id: string;
    startTime: string; // HH:mm
    duration: string; // MM:ss or HH:mm
    title: string;
    type: 'segment' | 'cue' | 'transition';
    status: 'completed' | 'active' | 'next' | 'pending';
    assignedTo?: string;
    notes?: string;
}

interface RunOfShowProps {
    items: RunOfShowItem[];
}

export function RunOfShow({ items }: RunOfShowProps) {
    // Auto-scroll to active item
    const activeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Play className="w-5 h-5 text-semantic-success fill-semantic-success" />
                    Live Run of Show
                </h3>
                <div className="flex items-center gap-4 text-sm font-mono text-zinc-400">
                    <span>START: 20:00</span>
                    <span className="text-semantic-success font-bold">CURRENT: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-[88px] top-0 bottom-0 w-px bg-zinc-800 z-0" />

                {items.map((item, _index) => {
                    const isActive = item.status === 'active';
                    const isCompleted = item.status === 'completed';

                    return (
                        <div
                            key={item.id}
                            ref={isActive ? activeRef : null}
                            className={cn(
                                "relative flex group transition-all duration-300 py-3",
                                isActive ? "scale-[1.02] z-10 my-4" : "opacity-80 hover:opacity-100"
                            )}
                        >
                            {/* Time Column */}
                            <div className="w-20 text-right pr-4 pt-1 font-mono text-sm font-medium z-10 flex flex-col items-end">
                                <span className={cn(
                                    isActive ? "text-semantic-success font-bold text-lg" : "text-zinc-500"
                                )}>
                                    {item.startTime}
                                </span>
                                <span className="text-xs text-zinc-600">{item.duration}</span>
                            </div>

                            {/* Timeline Node */}
                            <div className="relative z-10 flex flex-col items-center mr-4 pt-1">
                                {isActive ? (
                                    <div className="w-4 h-4 rounded-full bg-semantic-success shadow-[0_0_15px_hsl(var(--semantic-success)/0.6)] animate-pulse border-2 border-zinc-950" />
                                ) : isCompleted ? (
                                    <div className="w-3 h-3 rounded-full bg-zinc-800 border-2 border-zinc-600" />
                                ) : (
                                    <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-zinc-700" />
                                )}
                            </div>

                            {/* Card Content */}
                            <div className={cn(
                                "flex-1 p-3 rounded-lg border backdrop-blur-md transition-all",
                                isActive
                                    ? "bg-zinc-900/80 border-emerald-500/50 shadow-lg shadow-emerald-900/20"
                                    : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50"
                            )}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className={cn(
                                            "font-semibold",
                                            isActive ? "text-white text-lg" : "text-zinc-300"
                                        )}>{item.title}</h4>
                                        {item.notes && (
                                            <p className="text-sm text-zinc-500 mt-1">{item.notes}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant="outline" className={cn(
                                            "uppercase text-[10px] tracking-wider",
                                            item.type === 'cue' ? "border-semantic-warning/30 text-semantic-warning" : "border-zinc-700 text-zinc-500"
                                        )}>{item.type}</Badge>
                                    </div>
                                </div>

                                {/* Progress Bar (Mock) for Active Items */}
                                {isActive && (
                                    <div className="mt-3 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-semantic-success w-1/3 animate-[progress_10s_linear_infinite]" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
