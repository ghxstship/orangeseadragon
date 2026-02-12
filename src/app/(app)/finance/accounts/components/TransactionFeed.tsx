'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

// Mock data
const MOCK_TRANSACTIONS = [
    { id: 'tx_1', date: '2024-02-05', description: 'Stripe Payout', category: 'Income', amount: 15450.00, type: 'credit', status: 'cleared' },
    { id: 'tx_2', date: '2024-02-04', description: 'AWS Web Services', category: 'Infrastructure', amount: 2340.50, type: 'debit', status: 'cleared' },
    { id: 'tx_3', date: '2024-02-04', description: 'Slack Technologies', category: 'Software', amount: 890.00, type: 'debit', status: 'cleared' },
    { id: 'tx_4', date: '2024-02-03', description: 'Client Payment - Acme', category: 'Income', amount: 4500.00, type: 'credit', status: 'pending' },
    { id: 'tx_5', date: '2024-02-02', description: 'WeWork Rent', category: 'Office', amount: 6500.00, type: 'debit', status: 'cleared' },
];

export function TransactionFeed() {
    const [searchTerm, setSearchTerm] = useState('');

    // Calculate running balance (mock starting balance)
    let balance = 125000.00;
    const transactionsWithBalance = MOCK_TRANSACTIONS.map(tx => {
        // In a real app, this logic would be server-side or more robust
        // For visual display, we just show the balance AFTER the transaction, 
        // but typically you iterate backwards. Here we just mock it.
        const currentBalance = balance;
        if (tx.type === 'credit') balance -= tx.amount; // Reverse calculation for display if iterating forward? No.
        else balance += tx.amount;
        return { ...tx, runningBalance: currentBalance };
    });


    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9"
                />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[120px]">Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactionsWithBalance.map((tx) => (
                            <TableRow key={tx.id} className="group hover:bg-muted/50">
                                <TableCell className="font-mono text-xs">{tx.date}</TableCell>
                                <TableCell className="font-medium">{tx.description}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-normal text-xs">{tx.category}</Badge>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    <span className={tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                                        {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground">
                                    ${tx.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center text-xs ${tx.status === 'pending' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                        {tx.status === 'pending' ? <ClockIcon className="mr-1 h-3 w-3" /> : <CheckIcon className="mr-1 h-3 w-3" />}
                                        {tx.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function ClockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    )
}
