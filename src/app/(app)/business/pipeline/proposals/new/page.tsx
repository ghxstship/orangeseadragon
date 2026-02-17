'use client';

import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/common/page-shell';
import { ProposalBuilder } from '@/components/business/proposal-builder';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewProposalPage() {
  const router = useRouter();

  return (
    <PageShell
      title="New Proposal"
      description="Create a branded proposal with pricing, timeline, and e-signatures"
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push('/business/proposals')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Proposals
        </Button>
      }
    >
      <ProposalBuilder
        onSave={() => router.push('/business/proposals')}
        onSend={() => router.push('/business/proposals')}
      />
    </PageShell>
  );
}
