'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const productionSettingsTabs: SettingsTab[] = [
  {
    key: 'events',
    label: 'Events',
    sections: [
      {
        key: 'event_defaults',
        title: 'Event Defaults',
        description: 'Default values for new events',
        fields: [
          { key: 'default_event_type', label: 'Default Event Type', type: 'select', options: [
            { label: 'Concert', value: 'concert' },
            { label: 'Festival', value: 'festival' },
            { label: 'Corporate', value: 'corporate' },
            { label: 'Private', value: 'private' },
          ], defaultValue: 'concert' },
          { key: 'default_duration', label: 'Default Duration (hours)', type: 'number', defaultValue: 4 },
          { key: 'enable_templates', label: 'Enable event templates', type: 'switch', defaultValue: true },
          { key: 'require_venue', label: 'Require venue', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
  {
    key: 'shows',
    label: 'Shows',
    sections: [
      {
        key: 'show_settings',
        title: 'Show Settings',
        description: 'Configure show management',
        fields: [
          { key: 'default_show_duration', label: 'Default Duration (minutes)', type: 'number', defaultValue: 90 },
          { key: 'enable_setlist', label: 'Enable setlist', type: 'switch', defaultValue: true },
          { key: 'track_soundcheck', label: 'Track soundcheck', type: 'switch', defaultValue: true },
          { key: 'soundcheck_duration', label: 'Soundcheck Duration (minutes)', type: 'number', defaultValue: 60 },
        ],
      },
    ],
  },
  {
    key: 'advancing',
    label: 'Advancing',
    sections: [
      {
        key: 'advancing_settings',
        title: 'Advancing Settings',
        description: 'Configure advancing workflow',
        fields: [
          { key: 'deadline_days', label: 'Deadline (days before)', type: 'number', defaultValue: 14 },
          { key: 'require_tech_rider', label: 'Require tech rider', type: 'switch', defaultValue: true },
          { key: 'require_hospitality_rider', label: 'Require hospitality rider', type: 'switch', defaultValue: true },
          { key: 'auto_reminders', label: 'Auto-send reminders', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
  {
    key: 'automation',
    label: 'Automation',
    sections: [
      {
        key: 'automation_settings',
        title: 'Automation Settings',
        description: 'Configure automated behaviors',
        fields: [
          { key: 'auto_runsheets', label: 'Auto-generate runsheets', type: 'switch', defaultValue: true },
          { key: 'require_approval', label: 'Require approval for changes', type: 'switch', defaultValue: true },
          { key: 'notify_changes', label: 'Notify on schedule changes', type: 'switch', defaultValue: true },
        ],
      },
      {
        key: 'defaults',
        title: 'Regional Defaults',
        fields: [
          { key: 'default_currency', label: 'Default Currency', type: 'select', options: [
            { label: 'USD - US Dollar', value: 'USD' },
            { label: 'EUR - Euro', value: 'EUR' },
            { label: 'GBP - British Pound', value: 'GBP' },
          ], defaultValue: 'USD' },
          { key: 'default_timezone', label: 'Default Timezone', type: 'select', options: [
            { label: 'Eastern Time', value: 'America/New_York' },
            { label: 'Central Time', value: 'America/Chicago' },
            { label: 'Pacific Time', value: 'America/Los_Angeles' },
            { label: 'London', value: 'Europe/London' },
          ], defaultValue: 'America/New_York' },
        ],
      },
    ],
  },
];

export default function ProductionSettingsPage() {
  return (
    <SettingsTemplate
      title="Production Settings"
      description="Configure production management settings"
      tabs={productionSettingsTabs}
      onSave={async (values) => console.log('Saving:', values)}
    />
  );
}
