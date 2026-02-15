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
import { Search, Clock, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/use-supabase';
import { formatCurrency } from '@/lib/utils';

interface Transaction {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'credit' | 'debit';
    status: 'cleared' | 'pending';
}

export function TransactionFeed() {
    const { user } = useUser();
    const orgId = user?.user_metadata?.organization_id || null;
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        if (!orgId) return;
        const supabase = createClient();

        const fetchTransactions = async () => {
            const { data } = await supabase
                .from('bank_transactions')
                .select('id, transaction_date, description, transaction_type, amount_cents, is_reconciled, payee')
                .order('transaction_date', { ascending: false })
                .limit(50);

            const mapped: Transaction[] = (data ?? []).map((tx) => {
                const isCredit = tx.transaction_type === 'credit' || tx.transaction_type === 'deposit';
                return {
                    id: tx.id,
                    date: tx.transaction_date,
                    description: tx.payee || tx.description,
                    category: tx.transaction_type,
                    amount: Math.abs(tx.amount_cents) / 100,
                    type: isCredit ? 'credit' : 'debit',
                    status: tx.is_reconciled ? 'cleared' : 'pending',
                };
            });
            setTransactions(mapped);
        };

        fetchTransactions();
    }, [orgId]);

    const filtered = transactions.filter(tx =>
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    let balance = 0;
    const transactionsWithBalance = filtered.map(tx => {
        balance += tx.type === 'credit' ? tx.amount : -tx.amount;
        return { ...tx, runningBalance: balance };
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
                                    <span className={tx.type === 'credit' ? 'text-semantic-success' : ''}>
                                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground">
                                    {formatCurrency(tx.runningBalance)}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center text-xs ${tx.status === 'pending' ? 'text-semantic-warning' : 'text-semantic-success'}`}>
                                        {tx.status === 'pending' ? <Clock className="mr-1 h-3 w-3" /> : <CheckCircle2 className="mr-1 h-3 w-3" />}
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
