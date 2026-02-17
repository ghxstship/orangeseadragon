'use client';

import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/common/page-shell';
import { ScenarioBuilder } from '@/components/reports/scenario-builder';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { captureError } from '@/lib/observability';

export default function ScenarioBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();

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
        onSave={async (scenarios) => {
          try {
            const res = await fetch('/api/reports/schedules', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: `Scenario Comparison — ${new Date().toLocaleDateString()}`,
                report_type: 'scenario',
                filters: { scenarios },
              }),
            });
            if (!res.ok) throw new Error('Failed to save scenarios');
            toast({ title: 'Scenarios saved', description: `${scenarios.length} scenario(s) saved successfully.` });
            router.push('/analytics');
          } catch (err) {
            captureError(err, 'scenario-builder.save');
            toast({ title: 'Save failed', description: 'Could not save scenarios. Please try again.', variant: 'destructive' });
          }
        }}
      />
    </PageShell>
  );
}
