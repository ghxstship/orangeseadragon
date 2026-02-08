'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MoreHorizontal, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EntityProfileLayoutProps {
    title: string;
    subtitle?: string;
    avatarSrc?: string;
    initials?: string;
    type: 'company' | 'contact';
    sidebarContent?: React.ReactNode;
    children: React.ReactNode; // Content for tabs
    actions?: React.ReactNode;
    backPath?: string;
    meta: {
        email?: string;
        phone?: string;
        location?: string;
        website?: string;
    };
}

export function EntityProfileLayout({
    title,
    subtitle,
    avatarSrc,
    initials,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type,
    sidebarContent,
    children,
    actions,
    backPath,
    meta
}: EntityProfileLayoutProps) {
    const router = useRouter();

    return (
        <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-background">
            {/* --- LEFT SIDEBAR (Context) --- */}
            <div className="w-[320px] flex-shrink-0 border-r bg-muted/10 flex flex-col h-full">
                <div className="p-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
                        onClick={() => backPath ? router.push(backPath) : router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to List
                    </Button>

                    <div className="flex flex-col items-center text-center space-y-3 mb-6">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                            <AvatarImage src={avatarSrc} />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {initials || title.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                        </div>

                        <div className="flex gap-2">
                            {actions}
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3 text-sm">
                        {meta.email && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Mail className="w-4 h-4 text-primary/70" />
                                <span className="truncate hover:text-foreground cursor-pointer transition-colors">{meta.email}</span>
                            </div>
                        )}
                        {meta.phone && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Phone className="w-4 h-4 text-primary/70" />
                                <span>{meta.phone}</span>
                            </div>
                        )}
                        {meta.location && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <MapPin className="w-4 h-4 text-primary/70" />
                                <span>{meta.location}</span>
                            </div>
                        )}
                        {meta.website && (
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Globe className="w-4 h-4 text-primary/70" />
                                <a href={meta.website} target="_blank" rel="noreferrer" className="hover:underline text-blue-500">
                                    Visit Website
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4 pb-4">
                    {/* Custom sidebar content like Tags, Owner, etc. */}
                    {sidebarContent}

                    {/* Quick Stats Placeholder */}
                    <div className="mt-6 space-y-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parameters</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-background border rounded-md p-2">
                                <div className="text-[10px] text-muted-foreground">Health</div>
                                <div className="text-sm font-medium text-green-500">Good</div>
                            </div>
                            <div className="bg-background border rounded-md p-2">
                                <div className="text-[10px] text-muted-foreground">Touches</div>
                                <div className="text-sm font-medium">12</div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* --- MAIN CONTENT AREA ("Spatial" Cards) --- */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/5 relative">
                {/* Background gradient for "Liquid Glass" effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                <div className="flex-1 relative z-10 p-6 flex flex-col">
                    <Tabs defaultValue="timeline" className="h-full flex flex-col">
                        <TabsList className="bg-background/50 backdrop-blur-sm border w-fit">
                            <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
                            <TabsTrigger value="deals">Deals & Opportunities</TabsTrigger>
                            <TabsTrigger value="info">Detailed Info</TabsTrigger>
                            <TabsTrigger value="files">Documents</TabsTrigger>
                        </TabsList>

                        <div className="flex-1 mt-4 overflow-hidden">
                            {children}
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
