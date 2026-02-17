'use client';

import * as React from 'react';
import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const sandboxTabs: SettingsTab[] = [
  {
    key: 'overview',
    label: 'Overview',
    sections: [
      {
        key: 'status',
        title: 'Sandbox Environment',
        description: 'Test changes in an isolated environment before promoting to production',
        fields: [
          { key: 'sandbox_enabled', label: 'Sandbox mode', type: 'select', options: [
            { label: 'Disabled', value: 'disabled' },
            { label: 'Enabled', value: 'enabled' },
          ]},
          { key: 'created_at', label: 'Created', type: 'text' },
          { key: 'last_synced', label: 'Last synced from production', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'data',
    label: 'Data Management',
    sections: [
      {
        key: 'reset',
        title: 'Reset Sandbox Data',
        description: 'Reset all sandbox data to match current production state',
        fields: [],
      },
      {
        key: 'seed',
        title: 'Seed Sample Data',
        description: 'Populate sandbox with sample data for testing',
        fields: [
          { key: 'seed_type', label: 'Data set', type: 'select', options: [
            { label: 'Minimal (10 records per entity)', value: 'minimal' },
            { label: 'Standard (50 records per entity)', value: 'standard' },
            { label: 'Full (200+ records per entity)', value: 'full' },
          ]},
        ],
      },
    ],
  },
  {
    key: 'promote',
    label: 'Promote Changes',
    sections: [
      {
        key: 'review',
        title: 'Pending Changes',
        description: 'Review and promote sandbox changes to production',
        fields: [],
      },
    ],
  },
];

export default function SandboxPage() {
  return (
    <SettingsTemplate
      title="Sandbox"
      description="Test configuration changes in an isolated environment"
      tabs={sandboxTabs}
      onSave={async (values) => {
        await fetch('/api/settings/sandbox', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
      }}
    />
  );
}
