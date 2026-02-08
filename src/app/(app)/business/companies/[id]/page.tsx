'use client';

import { EntityProfileLayout } from '@/components/modules/business/EntityProfileLayout';
import { useCrud } from '@/lib/crud/hooks/useCrud';
import { companySchema } from '@/lib/schemas/company';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
    const { useRecord } = useCrud(companySchema);
    const { data: company, isLoading, error } = useRecord(params.id);

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Placeholder for deals related to this company */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Q1 Campaign</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">$12,000</p>
                            <Badge className="mt-2">Negotiation</Badge>
                        </CardContent>
                    </Card>
                    <Card className="border-dashed flex items-center justify-center min-h-[120px] cursor-pointer hover:bg-muted/50">
                        <p className="text-sm text-muted-foreground">+ Add Deal</p>
                    </Card>
                </div>
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
