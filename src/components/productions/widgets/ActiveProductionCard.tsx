'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Activity } from 'lucide-react';

export function ActiveProductionCard() {
    return (
        <Card className="h-full relative overflow-hidden border-zinc-800 bg-zinc-950">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-semantic-success/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-semantic-success/10 text-semantic-success border-semantic-success/50 hover:bg-semantic-success/20 animate-pulse">
                                <Activity className="w-3 h-3 mr-1" />
                                LIVE
                            </Badge>
                            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Global Tour 2026</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Neon Nights: Tokyo Leg</h3>
                    </div>

                    <div className="text-right">
                        <div className="text-3xl font-mono font-bold text-white">00:45:12</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Time to Doors</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
                        <MapPin className="w-5 h-5 text-indigo-400" />
                        <div>
                            <div className="text-xs text-zinc-500 uppercase">Venue</div>
                            <div className="text-sm font-medium text-zinc-200">Tokyo Dome</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm">
                        <Users className="w-5 h-5 text-destructive" />
                        <div>
                            <div className="text-xs text-zinc-500 uppercase">Attendance</div>
                            <div className="text-sm font-medium text-zinc-200">45,000 / 55,000</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
