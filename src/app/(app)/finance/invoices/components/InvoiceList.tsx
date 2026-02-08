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
import { useState } from 'react';

// Mock data integration would normally happen via props or a query hook
// For this component we will define the interface and assume data is passed or mocked

interface Invoice {
    id: string;
    invoice_number: string;
    customer_name: string;
    issue_date: string;
    due_date: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue' | 'draft';
}

const MOCK_INVOICES: Invoice[] = [
    { id: '1', invoice_number: 'INV-2024-001', customer_name: 'Acme Corp', issue_date: '2024-02-01', due_date: '2024-02-15', amount: 12500.00, status: 'paid' },
    { id: '2', invoice_number: 'INV-2024-002', customer_name: 'Globex Inc', issue_date: '2024-02-03', due_date: '2024-02-17', amount: 4500.50, status: 'pending' },
    { id: '3', invoice_number: 'INV-2024-003', customer_name: 'Soylent Corp', issue_date: '2024-01-15', due_date: '2024-01-30', amount: 8900.00, status: 'overdue' },
    { id: '4', invoice_number: 'INV-2024-004', customer_name: 'Initech', issue_date: '2024-02-05', due_date: '2024-02-19', amount: 3200.00, status: 'draft' },
];

interface InvoiceListProps {
    onSelectInvoice: (invoice: Invoice) => void;
}

export function InvoiceList({ onSelectInvoice }: InvoiceListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInvoices = MOCK_INVOICES.filter(inv =>
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
