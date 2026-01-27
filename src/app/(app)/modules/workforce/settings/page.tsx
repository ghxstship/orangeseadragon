'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const workforceSettingsTabs: SettingsTab[] = [
  {
    key: 'general',
    label: 'General',
    sections: [
      {
        key: 'roster',
        title: 'Roster Settings',
        fields: [
          { key: 'default_role', label: 'Default Role', type: 'select', options: [
            { label: 'Crew', value: 'crew' },
            { label: 'Lead', value: 'lead' },
            { label: 'Supervisor', value: 'supervisor' },
          ]},
          { key: 'require_certifications', label: 'Require certifications for roles', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
  {
    key: 'scheduling',
    label: 'Scheduling',
    sections: [
      {
        key: 'availability',
        title: 'Availability',
        fields: [
          { key: 'default_hours', label: 'Default weekly hours', type: 'number', defaultValue: 40 },
          { key: 'overtime_threshold', label: 'Overtime threshold (hours)', type: 'number', defaultValue: 40 },
          { key: 'allow_self_schedule', label: 'Allow self-scheduling', type: 'switch', defaultValue: false },
        ],
      },
    ],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    sections: [
      {
        key: 'alerts',
        title: 'Alert Settings',
        fields: [
          { key: 'notify_schedule_changes', label: 'Notify on schedule changes', type: 'switch', defaultValue: true },
          { key: 'reminder_hours', label: 'Shift reminder (hours before)', type: 'number', defaultValue: 24 },
        ],
      },
    ],
  },
];

export default function WorkforceSettingsPage() {
  return (
    <SettingsTemplate
      title="Workforce Settings"
      description="Configure workforce management settings"
      tabs={workforceSettingsTabs}
      onSave={async (values) => console.log('Saving:', values)}
    />
  );
}
