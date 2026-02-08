'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
    Users,
    Building2,
    AlertTriangle,
    Check,
    X,
    Merge,
    Loader2,
} from 'lucide-react';

interface DuplicateCandidate {
    id: string;
    entity_type: 'contact' | 'company';
    entity_id_1: string;
    entity_id_2: string;
    confidence_score: number;
    match_reasons: { field: string; reason: string; score: number }[];
    status: 'pending' | 'confirmed' | 'dismissed' | 'merged';
    detected_at: string;
    entity_1?: Record<string, unknown>;
    entity_2?: Record<string, unknown>;
}

interface DuplicateDetectionPanelProps {
    className?: string;
}

function ConfidenceBadge({ score }: { score: number }) {
    const variant = score >= 90 ? 'destructive' : score >= 70 ? 'default' : 'secondary';
    const label = score >= 90 ? 'High' : score >= 70 ? 'Medium' : 'Low';
    
    return (
        <Badge variant={variant} className="text-xs">
            {label} ({score}%)
        </Badge>
    );
}

function DuplicateCard({
    duplicate,
    onMerge,
    onDismiss,
    isProcessing,
}: {
    duplicate: DuplicateCandidate;
    onMerge: (id: string, survivingId: string) => void;
    onDismiss: (id: string) => void;
    isProcessing: boolean;
}) {
    const [showMergeDialog, setShowMergeDialog] = useState(false);
    const [selectedSurviving, setSelectedSurviving] = useState<string | null>(null);

    const entity1 = duplicate.entity_1 || {};
    const entity2 = duplicate.entity_2 || {};

    const getName = (entity: Record<string, unknown>) => {
        if (duplicate.entity_type === 'contact') {
            return `${entity.first_name || ''} ${entity.last_name || ''}`.trim() || 'Unknown';
        }
        return String(entity.name || 'Unknown');
    };

    const getSubtitle = (entity: Record<string, unknown>) => {
        if (duplicate.entity_type === 'contact') {
            return String(entity.email || entity.phone || '');
        }
        return String(entity.website || entity.email || '');
    };

    const handleMergeClick = () => {
        setShowMergeDialog(true);
    };

    const handleConfirmMerge = () => {
        if (selectedSurviving) {
            onMerge(duplicate.id, selectedSurviving);
            setShowMergeDialog(false);
        }
    };

    return (
        <>
            <Card className="mb-3">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {duplicate.entity_type === 'contact' ? (
                                <Users className="w-4 h-4 text-muted-foreground" />
                            ) : (
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-xs text-muted-foreground uppercase">
                                Potential Duplicate {duplicate.entity_type}
                            </span>
                        </div>
                        <ConfidenceBadge score={duplicate.confidence_score} />
                    </div>

                    {/* Side by side comparison */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div 
                            className={cn(
                                "p-3 rounded-lg border cursor-pointer transition-colors",
                                selectedSurviving === duplicate.entity_id_1 
                                    ? "border-primary bg-primary/5" 
                                    : "hover:border-muted-foreground/50"
                            )}
                            onClick={() => setSelectedSurviving(duplicate.entity_id_1)}
                        >
                            <p className="font-medium text-sm">{getName(entity1)}</p>
                            <p className="text-xs text-muted-foreground truncate">
                                {getSubtitle(entity1)}
                            </p>
                        </div>
                        <div 
                            className={cn(
                                "p-3 rounded-lg border cursor-pointer transition-colors",
                                selectedSurviving === duplicate.entity_id_2 
                                    ? "border-primary bg-primary/5" 
                                    : "hover:border-muted-foreground/50"
                            )}
                            onClick={() => setSelectedSurviving(duplicate.entity_id_2)}
                        >
                            <p className="font-medium text-sm">{getName(entity2)}</p>
                            <p className="text-xs text-muted-foreground truncate">
                                {getSubtitle(entity2)}
                            </p>
                        </div>
                    </div>

                    {/* Match reasons */}
                    <div className="flex flex-wrap gap-1 mb-4">
                        {duplicate.match_reasons.map((reason, idx) => (
                            <Badge key={idx} variant="outline" className="text-[10px]">
                                {reason.field}: {reason.reason}
                            </Badge>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDismiss(duplicate.id)}
                            disabled={isProcessing}
                        >
                            <X className="w-4 h-4 mr-1" />
                            Not a Duplicate
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleMergeClick}
                            disabled={isProcessing || !selectedSurviving}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                                <Merge className="w-4 h-4 mr-1" />
                            )}
                            Merge
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Merge</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will merge the two {duplicate.entity_type}s into one record. 
                            The selected record will be kept, and the other will be archived. 
                            All related activities, deals, and emails will be transferred.
                            This action can be undone within 30 days.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmMerge}>
                            Confirm Merge
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

export function DuplicateDetectionPanel({ className }: DuplicateDetectionPanelProps) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'contacts' | 'companies'>('contacts');

    // Fetch duplicates
    const { data, isLoading } = useQuery({
        queryKey: ['duplicates', activeTab],
        queryFn: async () => {
            const res = await fetch(`/api/duplicates?entity_type=${activeTab === 'contacts' ? 'contact' : 'company'}&status=pending`);
            if (!res.ok) throw new Error('Failed to load duplicates');
            return res.json();
        },
    });

    const duplicates: DuplicateCandidate[] = data?.records || [];

    // Merge mutation
    const mergeMutation = useMutation({
        mutationFn: async ({ id, survivingId }: { id: string; survivingId: string }) => {
            const res = await fetch(`/api/duplicates/${id}/merge`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ surviving_id: survivingId }),
            });
            if (!res.ok) throw new Error('Failed to merge');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['duplicates'] });
        },
    });

    // Dismiss mutation
    const dismissMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/duplicates/${id}/dismiss`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Failed to dismiss');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['duplicates'] });
        },
    });

    const handleMerge = (id: string, survivingId: string) => {
        mergeMutation.mutate({ id, survivingId });
    };

    const handleDismiss = (id: string) => {
        dismissMutation.mutate(id);
    };

    const isProcessing = mergeMutation.isPending || dismissMutation.isPending;

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        Duplicate Detection
                    </CardTitle>
                    {duplicates.length > 0 && (
                        <Badge variant="secondary">{duplicates.length} pending</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'contacts' | 'companies')} className="flex-1 flex flex-col">
                    <TabsList className="mx-4 mb-2">
                        <TabsTrigger value="contacts" className="flex-1">
                            <Users className="w-4 h-4 mr-2" />
                            Contacts
                        </TabsTrigger>
                        <TabsTrigger value="companies" className="flex-1">
                            <Building2 className="w-4 h-4 mr-2" />
                            Companies
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="contacts" className="flex-1 m-0">
                        <ScrollArea className="h-[400px] px-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : duplicates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Check className="w-10 h-10 text-green-500 mb-3" />
                                    <p className="text-sm font-medium">No duplicate contacts found</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Your contact database is clean
                                    </p>
                                </div>
                            ) : (
                                duplicates.map(duplicate => (
                                    <DuplicateCard
                                        key={duplicate.id}
                                        duplicate={duplicate}
                                        onMerge={handleMerge}
                                        onDismiss={handleDismiss}
                                        isProcessing={isProcessing}
                                    />
                                ))
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="companies" className="flex-1 m-0">
                        <ScrollArea className="h-[400px] px-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : duplicates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Check className="w-10 h-10 text-green-500 mb-3" />
                                    <p className="text-sm font-medium">No duplicate companies found</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Your company database is clean
                                    </p>
                                </div>
                            ) : (
                                duplicates.map(duplicate => (
                                    <DuplicateCard
                                        key={duplicate.id}
                                        duplicate={duplicate}
                                        onMerge={handleMerge}
                                        onDismiss={handleDismiss}
                                        isProcessing={isProcessing}
                                    />
                                ))
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export default DuplicateDetectionPanel;
