'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header'; // Ensure consistent import
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceDrawer } from './components/InvoiceDrawer';

export default function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null); // Ideally strictly typed
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleInvoiceSelect = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 pt-6">
      <PageHeader
        title="Invoices"
        description="Manage customer billing and payments"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        }
      />

      <InvoiceList onSelectInvoice={handleInvoiceSelect} />

      <InvoiceDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        invoice={selectedInvoice}
      />
    </div>
  );
}
