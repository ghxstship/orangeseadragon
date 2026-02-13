"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MatrixViewConfig } from "@/lib/schema/types";

interface MatrixItem {
    id: string;
    title: string;
    subtitle?: string;
    xValue: number;
    yValue: number;
    data: any;
}

interface MatrixViewProps {
    items: MatrixItem[];
    config: MatrixViewConfig;
    onItemClick?: (item: any) => void;
}

import { motion, AnimatePresence } from "framer-motion";

export function MatrixView({ items, config, onItemClick }: MatrixViewProps) {
    const getQuadrantItems = (quadrantId: number) => {
        return items.filter((item) => {
            const x = item.xValue;
            const y = item.yValue;

            if (quadrantId === 1) return x >= 6 && y >= 6;
            if (quadrantId === 2) return x < 6 && y >= 6;
            if (quadrantId === 3) return x >= 6 && y < 6;
            if (quadrantId === 4) return x < 6 && y < 6;
            return false;
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full min-h-[600px] p-2">
            {config.quadrants.map((quadrant, _idx) => {
                const quadrantItems = getQuadrantItems(quadrant.id);
                const colorClass = getQuadrantColor(quadrant.color);

                return (
                    <Card
                        key={quadrant.id}
                        className={cn("flex flex-col border-border glass-morphism overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-primary/5", colorClass.bg)}
                    >
                        <CardHeader className={cn("py-6 px-8 flex flex-row items-center justify-between space-y-0 border-b border-border bg-background/10")}>
                            <div>
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">
                                    {quadrant.label}
                                </CardTitle>
                                <p className="text-lg font-black tracking-tight opacity-90 leading-none">
                                    {quadrant.description}
                                </p>
                            </div>
                            <Badge variant="secondary" className="bg-muted backdrop-blur-xl border border-border text-[10px] font-black px-3 py-1">
                                {quadrantItems.length} ITEMS
                            </Badge>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {quadrantItems.map((item, itemIdx) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, delay: itemIdx * 0.05 }}
                                            whileHover={{ scale: 1.01, y: -2, rotate: 0.5 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => onItemClick?.(item.data)}
                                            className="p-5 bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.07] border border-border rounded-2xl cursor-pointer shadow-xl transition-all duration-300 group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                            <p className="text-xs font-black uppercase tracking-wider group-hover:text-primary transition-colors">
                                                {item.title}
                                            </p>
                                            {item.subtitle && (
                                                <p className="text-[11px] font-bold text-muted-foreground mt-2 line-clamp-2 opacity-60">
                                                    {item.subtitle}
                                                </p>
                                            )}
                                            <div className="flex gap-2 mt-4">
                                                <div className="flex items-center gap-1.5 text-[9px] font-black tracking-tighter text-muted-foreground/50 bg-muted px-2.5 py-1 rounded-lg border border-border shadow-inner">
                                                    <span className="opacity-40">U</span>
                                                    <span className="text-primary font-black opacity-100">{item.xValue}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] font-black tracking-tighter text-muted-foreground/50 bg-muted px-2.5 py-1 rounded-lg border border-border shadow-inner">
                                                    <span className="opacity-40">I</span>
                                                    <span className="text-primary font-black opacity-100">{item.yValue}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {quadrantItems.length === 0 && (
                                    <div className="h-40 flex flex-col items-center justify-center p-8 text-muted-foreground/20 text-[10px] font-black tracking-[0.3em] uppercase opacity-50 border-2 border-dashed border-border rounded-3xl">
                                        Empty Quadrant
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

function getQuadrantColor(color?: string) {
    switch (color) {
        case 'red':
            return { border: 'border-destructive/10', bg: 'bg-destructive/[0.02] shadow-[inner_0_0_50px_rgba(239,68,68,0.03)]' };
        case 'blue':
            return { border: 'border-semantic-info/10', bg: 'bg-semantic-info/[0.02]' };
        case 'yellow':
            return { border: 'border-semantic-warning/10', bg: 'bg-semantic-warning/[0.02]' };
        case 'gray':
            return { border: 'border-border', bg: 'bg-white/[0.01] shadow-[inner_0_0_50px_rgba(255,255,255,0.01)]' };
        default:
            return { border: 'border-border', bg: 'bg-white/[0.01]' };
    }
}
