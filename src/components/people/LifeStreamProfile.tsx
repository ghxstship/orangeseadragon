'use client';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Timeline, TimelineItem, TimelineDot, TimelineContent, TimelineHeader, TimelineTitle, TimelineDescription, TimelineTime } from '@/components/ui/timeline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Briefcase, Star } from 'lucide-react';
import type { EntityRecord } from '@/lib/schema/types';

interface SkillDataPoint {
    subject: string;
    A: number;
    fullMark: number;
}

interface TimelineEvent {
    title: string;
    time: string;
    description: string;
    icon: typeof Star;
    color: 'warning' | 'success' | 'default' | 'outline';
}

interface LifeStreamProfileProps {
    person: EntityRecord;
    skills?: SkillDataPoint[];
    events?: TimelineEvent[];
}

const DEFAULT_SKILLS: SkillDataPoint[] = [
    { subject: 'Strategy', A: 0, fullMark: 150 },
    { subject: 'Leadership', A: 0, fullMark: 150 },
    { subject: 'Technical', A: 0, fullMark: 150 },
    { subject: 'Culture', A: 0, fullMark: 150 },
    { subject: 'Communication', A: 0, fullMark: 150 },
    { subject: 'Execution', A: 0, fullMark: 150 },
];

function deriveSkillsFromPerson(person: EntityRecord): SkillDataPoint[] {
    const skills = person.skills as Record<string, number> | undefined;
    if (!skills || typeof skills !== 'object') return DEFAULT_SKILLS;
    return DEFAULT_SKILLS.map((s) => ({
        ...s,
        A: typeof skills[s.subject.toLowerCase()] === 'number' ? skills[s.subject.toLowerCase()] ?? 0 : s.A,
    }));
}

function deriveTimelineFromPerson(person: EntityRecord): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    if (person.created_at) {
        events.push({
            title: `Joined ${person.organization_name || 'the organization'}`,
            time: new Date(person.created_at as string).toLocaleDateString(),
            description: person.department ? `Started in the ${person.department} department.` : 'Started their journey.',
            icon: Trophy,
            color: 'outline',
        });
    }
    if (person.job_title) {
        events.unshift({
            title: `Current Role: ${person.job_title}`,
            time: 'Present',
            description: person.department ? `Working in ${person.department}.` : '',
            icon: Briefcase,
            color: 'default',
        });
    }
    return events.length > 0 ? events : [{
        title: 'No activity recorded yet',
        time: '',
        description: 'Activity will appear here as events occur.',
        icon: Star,
        color: 'default',
    }];
}

export function LifeStreamProfile({ person, skills, events }: LifeStreamProfileProps) {
    const skillData = skills ?? deriveSkillsFromPerson(person);
    const timelineEvents = events ?? deriveTimelineFromPerson(person);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

            {/* Col 1: Skill DNA (Spider Chart) */}
            <Card className="col-span-1 bg-card/80 border-border backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-lg text-foreground">Skill DNA</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
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
            <Card className="col-span-1 lg:col-span-2 bg-card/80 border-border backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-lg text-foreground flex items-center gap-2">
                        Life Stream
                        <Badge variant="outline" className="ml-2 text-xs font-normal text-muted-foreground border-border">Recent Activity</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Timeline>
                        {timelineEvents.map((item: TimelineEvent, idx: number) => (
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
