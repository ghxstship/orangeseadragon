'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DndContext } from '@dnd-kit/core';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Shift {
    id: string;
    resourceId: string;
    start: number;
    duration: number;
    label: string;
    conflict?: boolean;
}

interface Resource {
    id: string;
    name: string;
    role: string;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 10pm

export function SmartRostering() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);

    useEffect(() => {
        const supabase = createClient();
        const fetchData = async () => {
            // Fetch staff members as resources
            const { data: staff } = await supabase
                .from('staff_members')
                .select('id, user_id')
                .eq('is_active', true)
                .limit(20);

            const userIds = (staff ?? []).map(s => s.user_id).filter(Boolean);
            const { data: users } = userIds.length > 0
                ? await supabase.from('users').select('id, full_name').in('id', userIds)
                : { data: [] };
            const userMap = new Map((users ?? []).map(u => [u.id, u.full_name ?? 'Unknown']));

            const mappedResources: Resource[] = (staff ?? []).map(s => ({
                id: s.id,
                name: userMap.get(s.user_id) ?? 'Unknown',
                role: '',
            }));
            setResources(mappedResources);

            // Fetch crew assignments as shifts
            const staffIds = (staff ?? []).map(s => s.user_id);
            if (staffIds.length === 0) return;

            const { data: assignments } = await supabase
                .from('crew_assignments')
                .select('id, user_id, checked_in_at, checked_out_at, notes')
                .in('user_id', staffIds)
                .not('checked_in_at', 'is', null)
                .order('checked_in_at', { ascending: true })
                .limit(50);

            // Map staff user_id to staff id
            const userToStaffMap = new Map((staff ?? []).map(s => [s.user_id, s.id]));

            const mappedShifts: Shift[] = (assignments ?? []).map(a => {
                const checkinHour = a.checked_in_at ? new Date(a.checked_in_at).getHours() : 8;
                const checkoutHour = a.checked_out_at ? new Date(a.checked_out_at).getHours() : checkinHour + 8;
                const duration = Math.max(1, checkoutHour - checkinHour);
                return {
                    id: a.id,
                    resourceId: userToStaffMap.get(a.user_id) ?? a.user_id,
                    start: Math.max(6, Math.min(21, checkinHour)),
                    duration: Math.min(duration, 22 - checkinHour),
                    label: a.notes ?? 'Shift',
                };
            });

            // Detect conflicts (overlapping shifts for same resource)
            const byResource = new Map<string, Shift[]>();
            for (const s of mappedShifts) {
                if (!byResource.has(s.resourceId)) byResource.set(s.resourceId, []);
                byResource.get(s.resourceId)!.push(s);
            }
            for (const [, resShifts] of Array.from(byResource)) {
                for (let i = 0; i < resShifts.length; i++) {
                    for (let j = i + 1; j < resShifts.length; j++) {
                        const a = resShifts[i];
                        const b = resShifts[j];
                        if (a.start < b.start + b.duration && b.start < a.start + a.duration) {
                            a.conflict = true;
                            b.conflict = true;
                        }
                    }
                }
            }

            setShifts(mappedShifts);
        };
        fetchData();
    }, []);

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
                            {resources.map(resource => (
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
                                                            ? "bg-destructive/20 border-destructive/50 text-destructive/80 shadow-[0_0_15px_-3px_hsl(var(--destructive)/0.4)]"
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
                                                        <div className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5">
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
