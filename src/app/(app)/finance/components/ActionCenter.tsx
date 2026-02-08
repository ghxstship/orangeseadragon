'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Upload } from 'lucide-react';
import Link from 'next/link';

export function ActionCenter() {
    return (
        <Card className="col-span-2 h-full">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                    <Link href="/finance/invoices/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                    <Link href="/finance/expenses/new">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Receipt
                    </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12" asChild>
                    <Link href="/finance/reports/export">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Report
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
