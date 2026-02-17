'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/common/page-shell';
import { InvoiceGenerator } from '@/components/business/invoice-generator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function GenerateInvoicePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [rateCards, setRateCards] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('/api/projects?limit=100')
      .then((res) => res.json())
      .then((json) => {
        const items = json.data || [];
        setProjects(items.map((p: Record<string, unknown>) => ({ id: String(p.id), name: String(p.name || p.title || 'Untitled') })));
      })
      .catch(() => {});

    fetch('/api/rate-cards')
      .then((res) => res.json())
      .then((json) => {
        const items = json.data || [];
        setRateCards(items.map((rc: Record<string, unknown>) => ({ id: String(rc.id), name: String(rc.name || 'Unnamed') })));
      })
      .catch(() => {});
  }, []);

  return (
    <PageShell
      title="Generate Invoice from Time"
      description="Auto-create invoice drafts from billable time entries"
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push('/finance/invoices')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      }
    >
      <InvoiceGenerator
        projects={projects}
        rateCards={rateCards}
        onGenerated={(result) => {
          if (result.id) {
            router.push(`/finance/invoices/${result.id}`);
          }
        }}
      />
    </PageShell>
  );
}
