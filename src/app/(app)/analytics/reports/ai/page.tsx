'use client';

import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/common/page-shell';
import { AIReportBuilder } from '@/components/reports/ai-report-builder';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AIReportBuilderPage() {
  const router = useRouter();

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
        onSave={(report) => {
          console.log('Saved AI report:', report.title);
        }}
      />
    </PageShell>
  );
}
