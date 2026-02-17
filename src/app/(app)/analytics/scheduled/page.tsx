'use client';

import * as React from 'react';
import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const scheduledTabs: SettingsTab[] = [
  {
    key: 'schedules',
    label: 'Schedules',
    sections: [
      {
        key: 'active',
        title: 'Active Schedules',
        description: 'Reports scheduled for automatic delivery',
        fields: [
          { key: 'report', label: 'Report', type: 'select', options: [
            { label: 'Revenue by Client', value: 'revenue-client' },
            { label: 'Team Utilization', value: 'utilization' },
            { label: 'Pipeline Summary', value: 'pipeline' },
            { label: 'Budget Variance', value: 'budget-variance' },
          ]},
          { key: 'frequency', label: 'Frequency', type: 'select', options: [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
          ]},
          { key: 'format', label: 'Format', type: 'select', options: [
            { label: 'PDF', value: 'pdf' },
            { label: 'CSV', value: 'csv' },
            { label: 'Email Body', value: 'email' },
          ]},
          { key: 'recipients', label: 'Recipients', type: 'text' },
          { key: 'time', label: 'Delivery Time', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'history',
    label: 'Delivery History',
    sections: [
      {
        key: 'log',
        title: 'Recent Deliveries',
        description: 'Log of all scheduled report deliveries',
        fields: [],
      },
    ],
  },
];

export default function ScheduledReportsPage() {
  return (
    <SettingsTemplate
      title="Scheduled Reports"
      description="Automate report delivery on a recurring schedule"
      tabs={scheduledTabs}
      onSave={async (values) => {
        await fetch('/api/settings/scheduled-reports', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
      }}
    />
  );
}
