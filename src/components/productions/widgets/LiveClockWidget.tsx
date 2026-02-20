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
        <Card className="h-full bg-card border-border text-foreground flex flex-col justify-center items-center shadow-clock-glow">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono tracking-widest uppercase">
                    <Clock className="w-4 h-4" />
                    <span>Local Time</span>
                </div>
                <div className="text-5xl font-mono font-bold tracking-tighter text-semantic-success tabular-nums">
                    {timeString}
                </div>
                <div className="text-lg font-medium text-muted-foreground tracking-widest">
                    {dateString}
                </div>
            </CardContent>
        </Card>
    );
}
