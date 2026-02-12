'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export function LiveClockWidget() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Format: 21:09:45
    const timeString = time.toLocaleTimeString(undefined, {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    // Format: WED 24 OCT
    const dateString = time.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    }).toUpperCase();

    return (
        <Card className="h-full bg-black border-zinc-800 text-zinc-100 flex flex-col justify-center items-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <div className="flex items-center gap-2 text-zinc-500 text-sm font-mono tracking-widest uppercase">
                    <Clock className="w-4 h-4" />
                    <span>Local Time</span>
                </div>
                <div className="text-5xl font-mono font-bold tracking-tighter text-emerald-500 tabular-nums">
                    {timeString}
                </div>
                <div className="text-lg font-medium text-zinc-400 tracking-widest">
                    {dateString}
                </div>
            </CardContent>
        </Card>
    );
}
