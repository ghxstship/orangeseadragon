'use client';

import { ComplianceDashboard } from '@/components/people/ComplianceDashboard';
import { captureError } from '@/lib/observability';

export default function CompliancePage() {
  const handleSendReminder = async (itemIds: string[]) => {
    try {
      await fetch('/api/notifications/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds, type: 'compliance' }),
      });
    } catch (err) {
      captureError(err, 'compliance.sendReminder');
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <ComplianceDashboard
        onSendReminder={handleSendReminder}
        onExport={() => window.print()}
      />
    </div>
  );
}
