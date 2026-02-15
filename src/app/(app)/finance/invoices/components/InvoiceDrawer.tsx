'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Download, Send, CreditCard, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface InvoiceDrawerData {
    invoice_number?: string | number;
    status?: string;
    customer_name?: string | null;
    issue_date?: string | null;
    due_date?: string | null;
    total_amount?: number | null;
}

interface InvoiceDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    invoice: InvoiceDrawerData | null;
}

export function InvoiceDrawer({ open, onOpenChange, invoice }: InvoiceDrawerProps) {
    if (!invoice) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center justify-between">
                        <SheetTitle>Invoice #{invoice.invoice_number}</SheetTitle>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                            {invoice.status}
                        </Badge>
                    </div>
                    <SheetDescription>
                        Billed to {invoice.customer_name || 'Unknown Customer'}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Issue Date</p>
                            <p className="font-medium">{invoice.issue_date || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p className="font-medium">{invoice.due_date || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-medium text-lg">{formatCurrency(invoice.total_amount ?? 0)}</p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h4 className="text-sm font-medium mb-4">Activity Timeline</h4>
                        <div className="space-y-4">
                            {/* Mock timeline for now */}
                            <div className="flex items-start gap-3 text-sm">
                                <div className="p-2 bg-muted rounded-full"><Clock className="h-3 w-3" /></div>
                                <div>
                                    <p className="font-medium">Invoice Created</p>
                                    <p className="text-xs text-muted-foreground">Feb 5, 2026 at 10:00 AM</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <div className="p-2 bg-semantic-info/10 rounded-full"><Send className="h-3 w-3 text-semantic-info" /></div>
                                <div>
                                    <p className="font-medium">Sent to Client</p>
                                    <p className="text-xs text-muted-foreground">Feb 5, 2026 at 10:05 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="mt-8 flex-col gap-2 sm:flex-col items-stretch">
                    <Button className="w-full">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Record Payment
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                            <Download className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button variant="outline" className="flex-1">
                            <Send className="mr-2 h-4 w-4" /> Resend
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
