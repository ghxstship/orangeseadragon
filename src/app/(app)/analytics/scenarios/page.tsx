'use client';

import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/common/page-shell';
import { ScenarioBuilder } from '@/components/reports/scenario-builder';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ScenarioBuilderPage() {
  const router = useRouter();

  return (
    <PageShell
      title="Scenario Builder"
      description="Financial what-if modeling — compare outcomes across scenarios"
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push('/analytics')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Analytics
        </Button>
      }
    >
      <ScenarioBuilder
        onSave={(scenarios) => {
          console.log('Saved scenarios:', scenarios.length);
        }}
      />
    </PageShell>
  );
}
