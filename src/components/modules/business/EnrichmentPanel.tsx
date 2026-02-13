'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    Sparkles,
    RefreshCw,
    Check,
    X,
    AlertCircle,
    Loader2,
    Building2,
    User,
    Linkedin,
    Twitter,
    Phone,
    Briefcase,
    MapPin,
} from 'lucide-react';

interface EnrichmentPanelProps {
    entityType: 'contact' | 'company';
    entityId: string;
    className?: string;
}

interface EnrichmentResult {
    id: string;
    status: 'pending' | 'processing' | 'success' | 'partial' | 'failed' | 'not_found';
    provider_name: string;
    enriched_data: Record<string, unknown>;
    fields_updated: string[];
    confidence_score: number;
    completed_at: string;
    error_message?: string;
}

interface EnrichmentData {
    enrichment_status: string;
    enriched_at: string | null;
    enrichment_source: string | null;
    results: EnrichmentResult[];
}

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-semantic-warning', icon: RefreshCw },
    processing: { label: 'Processing', color: 'bg-blue-500', icon: Loader2 },
    success: { label: 'Enriched', color: 'bg-semantic-success', icon: Check },
    partial: { label: 'Partial', color: 'bg-orange-500', icon: AlertCircle },
    failed: { label: 'Failed', color: 'bg-destructive', icon: X },
    not_found: { label: 'Not Found', color: 'bg-gray-500', icon: AlertCircle },
    not_enriched: { label: 'Not Enriched', color: 'bg-gray-400', icon: Sparkles },
};

function EnrichedField({
    icon: Icon,
    label,
    value,
    isNew,
}: {
    icon: React.ElementType;
    label: string;
    value: string | null | undefined;
    isNew?: boolean;
}) {
    if (!value) return null;

    return (
        <div className="flex items-center gap-2 text-sm">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{label}:</span>
            <span className="font-medium">{value}</span>
            {isNew && (
                <Badge variant="secondary" className="text-[10px] px-1">
                    NEW
                </Badge>
            )}
        </div>
    );
}

export function EnrichmentPanel({ entityType, entityId, className }: EnrichmentPanelProps) {
    const queryClient = useQueryClient();
    const [isEnriching, setIsEnriching] = useState(false);

    // Fetch enrichment data
    const { data, isLoading } = useQuery({
        queryKey: ['enrichment', entityType, entityId],
        queryFn: async () => {
            const res = await fetch(`/api/${entityType}s/${entityId}/enrichment`);
            if (!res.ok) {
                if (res.status === 404) return null;
                throw new Error('Failed to load enrichment data');
            }
            return res.json() as Promise<EnrichmentData>;
        },
        enabled: !!entityId,
    });

    // Enrich mutation
    const enrichMutation = useMutation({
        mutationFn: async () => {
            setIsEnriching(true);
            const res = await fetch(`/api/${entityType}s/${entityId}/enrich`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Failed to enrich');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enrichment', entityType, entityId] });
            queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
        },
        onSettled: () => {
            setIsEnriching(false);
        },
    });

    const handleEnrich = () => {
        enrichMutation.mutate();
    };

    const status = data?.enrichment_status || 'not_enriched';
    const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_enriched;
    const StatusIcon = statusInfo.icon;

    if (isLoading) {
        return (
            <Card className={className}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    const latestResult = data?.results?.[0];
    const enrichedData = latestResult?.enriched_data || {};

    return (
        <Card className={className}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Data Enrichment
                    </CardTitle>
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "text-xs",
                            status === 'success' && "border-semantic-success text-semantic-success",
                            status === 'failed' && "border-destructive text-destructive"
                        )}
                    >
                        <StatusIcon className={cn(
                            "w-3 h-3 mr-1",
                            status === 'processing' && "animate-spin"
                        )} />
                        {statusInfo.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {status === 'not_enriched' ? (
                    <div className="text-center py-4">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground mb-3">
                            Enrich this {entityType} with data from external sources
                        </p>
                        <Button
                            size="sm"
                            onClick={handleEnrich}
                            disabled={isEnriching}
                        >
                            {isEnriching ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            Enrich Now
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Confidence score */}
                        {latestResult?.confidence_score && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Match Confidence</span>
                                    <span className="font-medium">{latestResult.confidence_score}%</span>
                                </div>
                                <Progress value={latestResult.confidence_score} className="h-1" />
                            </div>
                        )}

                        {/* Enriched fields */}
                        {entityType === 'contact' && (
                            <div className="space-y-2">
                                <EnrichedField
                                    icon={Briefcase}
                                    label="Title"
                                    value={enrichedData.job_title as string}
                                    isNew={latestResult?.fields_updated?.includes('job_title')}
                                />
                                <EnrichedField
                                    icon={Building2}
                                    label="Department"
                                    value={enrichedData.department as string}
                                    isNew={latestResult?.fields_updated?.includes('department')}
                                />
                                <EnrichedField
                                    icon={Phone}
                                    label="Phone"
                                    value={enrichedData.phone as string}
                                    isNew={latestResult?.fields_updated?.includes('phone')}
                                />
                                <EnrichedField
                                    icon={Linkedin}
                                    label="LinkedIn"
                                    value={enrichedData.linkedin_url as string}
                                    isNew={latestResult?.fields_updated?.includes('linkedin_url')}
                                />
                                <EnrichedField
                                    icon={Twitter}
                                    label="Twitter"
                                    value={enrichedData.twitter_handle as string}
                                    isNew={latestResult?.fields_updated?.includes('twitter_handle')}
                                />
                                <EnrichedField
                                    icon={MapPin}
                                    label="Location"
                                    value={(enrichedData.location as Record<string, string>)?.city}
                                    isNew={latestResult?.fields_updated?.includes('location')}
                                />
                            </div>
                        )}

                        {entityType === 'company' && (
                            <div className="space-y-2">
                                <EnrichedField
                                    icon={Building2}
                                    label="Industry"
                                    value={enrichedData.industry as string}
                                    isNew={latestResult?.fields_updated?.includes('industry')}
                                />
                                <EnrichedField
                                    icon={User}
                                    label="Employees"
                                    value={enrichedData.employee_count?.toString()}
                                    isNew={latestResult?.fields_updated?.includes('employee_count')}
                                />
                                <EnrichedField
                                    icon={Briefcase}
                                    label="Funding"
                                    value={enrichedData.funding_stage as string}
                                    isNew={latestResult?.fields_updated?.includes('funding_stage')}
                                />
                                <EnrichedField
                                    icon={MapPin}
                                    label="HQ"
                                    value={(enrichedData.location as Record<string, string>)?.city}
                                    isNew={latestResult?.fields_updated?.includes('location')}
                                />
                            </div>
                        )}

                        {/* Source and timestamp */}
                        <div className="pt-2 border-t text-[10px] text-muted-foreground flex items-center justify-between">
                            <span>
                                Source: {data?.enrichment_source || latestResult?.provider_name || 'Unknown'}
                            </span>
                            {data?.enriched_at && (
                                <span>
                                    {new Date(data.enriched_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        {/* Re-enrich button */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleEnrich}
                            disabled={isEnriching}
                        >
                            {isEnriching ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Re-enrich
                        </Button>

                        {/* Error message */}
                        {latestResult?.error_message && (
                            <div className="flex items-start gap-2 text-xs text-destructive">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{latestResult.error_message}</span>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default EnrichmentPanel;
