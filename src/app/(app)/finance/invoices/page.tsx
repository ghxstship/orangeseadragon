'use client';

import { useState } from 'react';
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
    <div className="flex flex-col h-full bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage customer billing and payments</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <InvoiceList onSelectInvoice={handleInvoiceSelect} />

        <InvoiceDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          invoice={selectedInvoice}
        />
      </div>
    </div>
  );
}
