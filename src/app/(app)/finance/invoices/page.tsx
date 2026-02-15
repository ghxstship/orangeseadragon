'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PageShell } from '@/components/common/page-shell';
import { InvoiceList, type InvoiceListItem } from './components/InvoiceList';
import { InvoiceDrawer } from './components/InvoiceDrawer';

export default function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceListItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleInvoiceSelect = (invoice: InvoiceListItem) => {
    setSelectedInvoice(invoice);
    setIsDrawerOpen(true);
  };

  return (
    <PageShell
      title="Invoices"
      description="Manage customer billing and payments"
      actions={
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      }
      contentClassName="space-y-6"
    >
        <InvoiceList onSelectInvoice={handleInvoiceSelect} />

        <InvoiceDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          invoice={selectedInvoice}
        />
    </PageShell>
  );
}
