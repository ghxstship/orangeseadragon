'use client';

import { useEffect, useState } from 'react';
import { EntityProfileLayout } from '@/components/modules/business/EntityProfileLayout';
import { useCrud } from '@/lib/crud/hooks/useCrud';
import { companySchema } from '@/lib/schemas/company';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ContextualEmptyState } from '@/components/common/contextual-empty-state';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface CompanyDeal {
    id: string;
    name: string;
    value: number;
    stage: string;
}

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
    const { useRecord } = useCrud(companySchema);
    const { data: company, isLoading, error } = useRecord(params.id);
    const [deals, setDeals] = useState<CompanyDeal[]>([]);
    const [dealsLoading, setDealsLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        const fetchDeals = async () => {
            setDealsLoading(true);
            const { data } = await supabase
                .from('deals')
                .select('id, name, value, stage')
                .eq('company_id', params.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .limit(6);

            setDeals((data ?? []) as CompanyDeal[]);
            setDealsLoading(false);
        };

        fetchDeals();
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="p-8 text-center text-destructive">
                <h1 className="text-xl font-bold">Company not found</h1>
                <p>The requested company could not be loaded.</p>
            </div>
        );
    }

    return (
        <EntityProfileLayout
            title={company.name}
            subtitle={company.industry}
            type="company"
            meta={{
                email: company.email,
                phone: company.phone,
                website: company.website,
                location: company.address
            }}
            backPath="/modules/business/companies"
            sidebarContent={
                <div className="space-y-4">
                    <div className="mt-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details</h4>
                        <div className="space-y-2">
                            <Badge variant="outline">{company.company_type}</Badge>
                        </div>
                    </div>
                    {company.notes && (
                        <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h4>
                            <p className="text-xs text-muted-foreground">{company.notes}</p>
                        </div>
                    )}
                </div>
            }
        >
            <TabsContent value="timeline" className="h-full p-0 m-0 overflow-auto">
                <div className="p-4 space-y-4 max-w-3xl">
                    <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                    {/* Placeholder for timeline */}
                    <div className="border-l-2 border-muted pl-4 space-y-8">
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary" />
                            <p className="text-sm font-medium">Company Created</p>
                            <p className="text-xs text-muted-foreground">Just now</p>
                        </div>
                        <div className="relative">
                            <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-muted-foreground/30" />
                            <p className="text-sm font-medium">Initial Contact</p>
                            <p className="text-xs text-muted-foreground">Logged manually</p>
                        </div>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="deals" className="h-full p-4 overflow-auto">
                <h3 className="text-lg font-semibold mb-4">Active Deals</h3>
                {dealsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-[126px] w-full rounded-lg" />
                        <Skeleton className="h-[126px] w-full rounded-lg" />
                    </div>
                ) : deals.length === 0 ? (
                    <ContextualEmptyState
                        type="no-data"
                        title="No deals found"
                        description="This company has no deals associated yet."
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {deals.map((deal) => (
                            <Card key={deal.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">{deal.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{formatCurrency(deal.value ?? 0)}</p>
                                    <Badge className="mt-2" variant="outline">
                                        {(deal.stage || 'unknown').replace(/_/g, ' ')}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="info" className="h-full p-4 overflow-auto">
                <h3 className="text-lg font-semibold mb-4">Full Details</h3>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
                    {JSON.stringify(company, null, 2)}
                </pre>
            </TabsContent>

            <TabsContent value="files" className="h-full p-4 overflow-auto">
                <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No files uploaded</p>
                </div>
            </TabsContent>
        </EntityProfileLayout>
    );
}
