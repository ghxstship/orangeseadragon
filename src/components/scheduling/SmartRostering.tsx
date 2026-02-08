'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext } from '@dnd-kit/core';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle } from 'lucide-react';

// Mock Data
const MOCK_SHIFTS = [
    { id: 's1', resourceId: 'r1', start: 8, duration: 8, label: 'Main Stage Setup' },
    { id: 's2', resourceId: 'r2', start: 10, duration: 6, label: 'Audio Check' },
    { id: 's3', resourceId: 'r3', start: 14, duration: 4, label: 'Lighting Rig' },
    { id: 's4', resourceId: 'r1', start: 18, duration: 4, label: 'Evening Run', conflict: true }, // Artificial conflict
];

const RESOURCES = [
    { id: 'r1', name: 'Sarah Jenkis', role: 'Stage Mgr' },
    { id: 'r2', name: 'Mike Ross', role: 'Audio Eng' },
    { id: 'r3', name: 'Jessica Lee', role: 'Lighting' },
    { id: 'r4', name: 'Tom Hiddleston', role: 'Runner' },
];

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 10pm

export function SmartRostering() {
    const [shifts, _setShifts] = useState(MOCK_SHIFTS);

    // Simplified Dnd implementation placeholder - full implementation would handle coordinate mapping

    return (
        <Card className="border-border bg-zinc-900/40 backdrop-blur-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Smart Rostering</CardTitle>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs bg-zinc-800">Day View</Badge>
                    <Badge variant="secondary" className="text-xs">Week View</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Timeline Header */}
                    <div className="flex border-b border-border">
                        <div className="w-48 p-4 shrink-0 font-medium text-zinc-400">Resource</div>
                        <div className="flex-1 flex">
                            {HOURS.map(h => (
                                <div key={h} className="flex-1 px-1 py-4 text-xs text-zinc-500 border-l border-border text-center">
                                    {h}:00
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resources Rows */}
                    <DndContext>
                        <div className="divide-y divide-border">
                            {RESOURCES.map(resource => (
                                <div key={resource.id} className="flex group bg-zinc-900/20 hover:bg-zinc-800/30 transition-colors">
                                    {/* Resource Info */}
                                    <div className="w-48 p-4 shrink-0 flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-zinc-700 text-xs">{resource.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-medium truncate text-zinc-200">{resource.name}</div>
                                            <div className="text-xs text-zinc-500 truncate">{resource.role}</div>
                                        </div>
                                    </div>

                                    {/* Timeline Channel */}
                                    <div className="flex-1 relative h-16 bg-white/[0.01]">
                                        {/* Grid Lines */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {HOURS.map(h => (
                                                <div key={h} className="flex-1 border-l border-border h-full" />
                                            ))}
                                        </div>

                                        {/* Shifts */}
                                        {shifts.filter(s => s.resourceId === resource.id).map(shift => {
                                            // Calculate position based on simplified 6am start
                                            const startOffsetPercent = ((shift.start - 6) / HOURS.length) * 100;
                                            const widthPercent = (shift.duration / HOURS.length) * 100;

                                            return (
                                                <motion.div
                                                    key={shift.id}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={cn(
                                                        "absolute top-2 bottom-2 rounded-md border text-xs flex items-center px-2 cursor-pointer hover:brightness-110 shadow-lg",
                                                        shift.conflict
                                                            ? "bg-rose-500/20 border-rose-500/50 text-rose-200 shadow-[0_0_15px_-3px_rgba(244,63,94,0.4)]"
                                                            : "bg-indigo-500/30 border-indigo-400/30 text-indigo-100"
                                                    )}
                                                    style={{
                                                        left: `${startOffsetPercent}%`,
                                                        width: `${widthPercent}%`
                                                    }}
                                                >
                                                    <Clock className="w-3 h-3 mr-1 opacity-70" />
                                                    <span className="truncate font-medium">{shift.label}</span>

                                                    {shift.conflict && (
                                                        <div className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5">
                                                            <AlertCircle className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DndContext>
                </div>
            </CardContent>
        </Card>
    );
}
