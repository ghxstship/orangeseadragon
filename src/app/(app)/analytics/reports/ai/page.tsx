'use client';

import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/common/page-shell';
import { AIReportBuilder } from '@/components/reports/ai-report-builder';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { captureError } from '@/lib/observability';

export default function AIReportBuilderPage() {
  const router = useRouter();
  const { toast } = useToast();

  return (
    <PageShell
      title="AI Report Builder"
      description="Describe the report you need in plain language"
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push('/analytics/reports')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Reports
        </Button>
      }
    >
      <AIReportBuilder
        onSave={async (report) => {
          try {
            const res = await fetch('/api/reports/schedules', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: report.title,
                description: report.description,
                report_type: report.chartType,
                filters: { metrics: report.metrics, dimensionKey: report.dimensionKey, sql: report.sql },
              }),
            });
            if (!res.ok) throw new Error('Failed to save report');
            toast({ title: 'Report saved', description: `"${report.title}" has been saved to your reports.` });
            router.push('/analytics/reports');
          } catch (err) {
            captureError(err, 'ai-report.save');
            toast({ title: 'Save failed', description: 'Could not save the report. Please try again.', variant: 'destructive' });
          }
        }}
      />
    </PageShell>
  );
}
