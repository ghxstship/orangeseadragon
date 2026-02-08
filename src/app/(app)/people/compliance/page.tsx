'use client';

import { ComplianceDashboard } from '@/components/people/ComplianceDashboard';

export default function CompliancePage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <ComplianceDashboard 
        onSendReminder={(ids) => console.log('Send reminders to:', ids)}
        onExport={() => console.log('Export compliance report')}
      />
    </div>
  );
}
