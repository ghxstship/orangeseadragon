'use client';

import { ComplianceDashboard } from '@/components/people/ComplianceDashboard';

export default function CompliancePage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <ComplianceDashboard
        onSendReminder={() => { /* TODO: implement send reminders */ }}
        onExport={() => { /* TODO: implement export */ }}
      />
    </div>
  );
}
