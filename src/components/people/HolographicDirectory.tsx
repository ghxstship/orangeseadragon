'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { User, MapPin, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Person {
    id: string;
    headline: string;
    location?: string;
    status: 'online' | 'away' | 'offline' | 'on-leave';
    is_available_for_hire: boolean;
    avatar_url?: string;
    department?: string;
}

interface HolographicDirectoryProps {
    people: Person[];
    onSelectPerson: (id: string) => void;
}

export function HolographicDirectory({ people, onSelectPerson }: HolographicDirectoryProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {people.map((person) => (
                <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{
                        scale: 1.02,
                        boxShadow: "0 20px 40px -12px rgba(0,0,0,0.5)"
                    }}
                    onClick={() => onSelectPerson(person.id)}
                    className={cn(
                        "group relative cursor-pointer overflow-hidden rounded-2xl border border-border",
                        "bg-card/70 backdrop-blur-xl", // Liquid Glass effect
                        "hover:border-border hover:bg-card/90 transition-all duration-300"
                    )}
                >
                    {/* Status Indicator Glow */}
                    <div className={cn(
                        "absolute top-0 right-0 h-24 w-24 rounded-full blur-3xl opacity-20 -mr-6 -mt-6 transition-colors duration-500",
                        person.status === 'online' && "bg-semantic-success",
                        person.status === 'away' && "bg-semantic-warning",
                        person.status === 'on-leave' && "bg-destructive",
                        person.status === 'offline' && "bg-muted-foreground",
                    )} />

                    <div className="p-6 relative z-10 flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-muted/70 to-muted border border-border flex items-center justify-center shadow-inner">
                                {person.avatar_url ? (
                                    <Image src={person.avatar_url} alt={person.headline} className="h-full w-full rounded-full object-cover" fill unoptimized />
                                ) : (
                                    <User className="w-8 h-8 text-muted-foreground/70" />
                                )}
                            </div>
                            <Badge variant={person.is_available_for_hire ? "default" : "secondary"} className="bg-muted border-border hover:bg-accent text-xs">
                                {person.is_available_for_hire ? 'Available' : 'Busy'}
                            </Badge>
                        </div>

                        {/* Info */}
                        <div className="space-y-2 mb-6 flex-grow">
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {person.headline || 'Untitled Profile'}
                            </h3>

                            <div className="space-y-1">
                                {person.department && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Briefcase className="w-4 h-4 mr-2 opacity-70" />
                                        {person.department}
                                    </div>
                                )}
                                {person.location && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4 mr-2 opacity-70" />
                                        {person.location}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Status */}
                        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    person.status === 'online' && "bg-semantic-success animate-pulse",
                                    person.status === 'away' && "bg-semantic-warning",
                                    person.status === 'on-leave' && "bg-destructive",
                                    person.status === 'offline' && "bg-muted-foreground/80",
                                )} />
                                {person.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                View Profile →
                            </span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
