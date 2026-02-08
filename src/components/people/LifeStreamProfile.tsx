'use client';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Timeline, TimelineItem, TimelineDot, TimelineContent, TimelineHeader, TimelineTitle, TimelineDescription, TimelineTime } from '@/components/ui/timeline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Briefcase, Star } from 'lucide-react';

interface LifeStreamProfileProps {
    person: any; // Using any for flexibility with schema, ideally strictly typed
}

// Mock data for visualizations
const SKILL_DATA = [
    { subject: 'Strategy', A: 120, fullMark: 150 },
    { subject: 'Leadership', A: 98, fullMark: 150 },
    { subject: 'Technical', A: 86, fullMark: 150 },
    { subject: 'Culture', A: 99, fullMark: 150 },
    { subject: 'Communication', A: 85, fullMark: 150 },
    { subject: 'Execution', A: 65, fullMark: 150 },
];

const TIMELINE_EVENTS = [
    {
        title: 'Promoted to Senior Manager',
        time: '2 days ago',
        description: 'Advanced due to exceptional performance in Q1.',
        icon: Star,
        color: 'warning' as const
    },
    {
        title: 'Completed "Safety First" Certification',
        time: '1 week ago',
        description: 'Mandatory annual safety refresher.',
        icon: Award,
        color: 'success' as const
    },
    {
        title: 'Joined "Alpha" Project Team',
        time: '1 month ago',
        description: 'Assigned as lead technical resource.',
        icon: Briefcase,
        color: 'default' as const
    },
    {
        title: 'Hired at ATLVS',
        time: '6 months ago',
        description: 'Started journey in the Engineering department.',
        icon: Trophy,
        color: 'outline' as const
    },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function LifeStreamProfile({ person }: LifeStreamProfileProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

            {/* Col 1: Skill DNA (Spider Chart) */}
            <Card className="col-span-1 bg-zinc-900/50 border-border backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-lg text-zinc-300">Skill DNA</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_DATA}>
                            <PolarGrid stroke="hsl(var(--chart-tooltip-border))" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--chart-axis))', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                            <Radar
                                name="Skills"
                                dataKey="A"
                                stroke="hsl(var(--chart-income))"
                                strokeWidth={2}
                                fill="hsl(var(--chart-income))"
                                fillOpacity={0.3}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Col 2 & 3: Life Stream (Timeline) */}
            <Card className="col-span-1 lg:col-span-2 bg-zinc-900/50 border-border backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-lg text-zinc-300 flex items-center gap-2">
                        Life Stream
                        <Badge variant="outline" className="ml-2 text-xs font-normal text-zinc-400 border-zinc-700">Recent Activity</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Timeline>
                        {TIMELINE_EVENTS.map((item, idx) => (
                            <TimelineItem key={idx}>
                                <TimelineDot variant={item.color}>
                                    <item.icon className="h-3 w-3 text-white" />
                                </TimelineDot>
                                <TimelineContent>
                                    <TimelineHeader>
                                        <TimelineTitle>{item.title}</TimelineTitle>
                                        <TimelineTime>{item.time}</TimelineTime>
                                    </TimelineHeader>
                                    <TimelineDescription>{item.description}</TimelineDescription>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                </CardContent>
            </Card>

        </div>
    );
}
