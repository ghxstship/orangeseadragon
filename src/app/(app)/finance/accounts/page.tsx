'use client';

import { TransactionFeed } from './components/TransactionFeed';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PageShell } from '@/components/common/page-shell';

export default function AccountsPage() {
  return (
    <PageShell
      title="Accounts & Transactions"
      description="Monitor bank feeds and ledger entries"
      actions={
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export Statement
        </Button>
      }
    >
      <div>
        <TransactionFeed />
      </div>
    </PageShell>
  );
}
