'use client';

import { TransactionFeed } from './components/TransactionFeed';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function AccountsPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Accounts & Transactions</h1>
            <p className="text-muted-foreground">Monitor bank feeds and ledger entries</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Statement
          </Button>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-6">
        <TransactionFeed />
      </div>
    </div>
  );
}
