'use client';

import { PageHeader } from '@/components/common/page-header';
import { TransactionFeed } from './components/TransactionFeed';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function AccountsPage() {
  return (
    <div className="space-y-6 pt-6">
      <PageHeader
        title="Accounts & Transactions"
        description="Monitor bank feeds and ledger entries"
        actions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Statement
          </Button>
        }
      />
      <TransactionFeed />
    </div>
  );
}
