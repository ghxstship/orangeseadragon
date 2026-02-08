'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Cloud, CloudRain, Wind } from 'lucide-react';

export function WeatherWidget() {
    return (
        <Card className="h-full bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardContent className="h-full p-6 flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium uppercase tracking-wider">
                        <span>Venue Weather</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">72°</span>
                        <span className="text-zinc-500 text-sm">F</span>
                    </div>
                    <p className="text-sm text-zinc-400">Mostly Cloudy</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <Cloud className="w-10 h-10 text-cyan-400" />
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Wind className="w-3 h-3" />
                        <span>8 mph NW</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <CloudRain className="w-3 h-3" />
                        <span>10%</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
