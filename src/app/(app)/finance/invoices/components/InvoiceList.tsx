'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/status-badge';
import { Search, Filter, MoreHorizontal, Eye, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useState, useMemo } from 'react';
import { useInvoices } from '@/hooks/use-invoices';
import { useUser } from '@/hooks/use-supabase';

interface Invoice {
    id: string;
    invoice_number: string;
    customer_name: string;
    issue_date: string;
    due_date: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue' | 'draft';
}

function mapInvoiceStatus(status: string | null, dueDate: string | null): Invoice['status'] {
    if (status === 'paid') return 'paid';
    if (status === 'draft') return 'draft';
    if (status === 'sent' || status === 'pending') {
        if (dueDate && new Date(dueDate) < new Date()) return 'overdue';
        return 'pending';
    }
    if (status === 'overdue') return 'overdue';
    return 'draft';
}

interface InvoiceListProps {
    onSelectInvoice: (invoice: Invoice) => void;
}

export function InvoiceList({ onSelectInvoice }: InvoiceListProps) {
    const { user } = useUser();
    const orgId = user?.user_metadata?.organization_id || null;
    const { data: rawInvoices } = useInvoices(orgId);
    const [searchTerm, setSearchTerm] = useState('');

    const invoices: Invoice[] = useMemo(() => {
        if (!rawInvoices) return [];
        return rawInvoices.map((inv) => ({
            id: inv.id,
            invoice_number: inv.invoice_number ?? inv.id.slice(0, 8),
            customer_name: inv.company_id ?? 'Unknown',
            issue_date: inv.issue_date ?? '',
            due_date: inv.due_date ?? '',
            amount: inv.total_amount ?? 0,
            status: mapInvoiceStatus(inv.status, inv.due_date),
        }));
    }, [rawInvoices]);

    const filteredInvoices = invoices.filter(inv =>
        inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 w-full max-w-sm">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9"
                    />
                </div>
                <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvoices.map((invoice) => (
                            <TableRow
                                key={invoice.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => onSelectInvoice(invoice)}
                            >
                                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                                <TableCell>{invoice.customer_name}</TableCell>
                                <TableCell>{invoice.issue_date}</TableCell>
                                <TableCell>{invoice.due_date}</TableCell>
                                <TableCell className="text-right font-mono">${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell>
                                    <StatusBadge status={invoice.status} />
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onSelectInvoice(invoice)}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Download className="mr-2 h-4 w-4" /> Download PDF
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
