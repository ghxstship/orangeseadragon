'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const projectSettingsTabs: SettingsTab[] = [
  {
    key: 'general',
    label: 'General',
    sections: [
      {
        key: 'defaults',
        title: 'Project Defaults',
        description: 'Configure default settings for new projects',
        fields: [
          { key: 'default_status', label: 'Default Status', type: 'select', options: [
            { label: 'Planning', value: 'planning' },
            { label: 'Active', value: 'active' },
            { label: 'On Hold', value: 'on_hold' },
          ]},
          { key: 'default_visibility', label: 'Default Visibility', type: 'select', options: [
            { label: 'Public', value: 'public' },
            { label: 'Team Only', value: 'team' },
            { label: 'Private', value: 'private' },
          ]},
          { key: 'auto_archive_days', label: 'Auto-archive after (days)', type: 'number', defaultValue: 90 },
        ],
      },
      {
        key: 'naming',
        title: 'Naming & Numbering',
        fields: [
          { key: 'project_prefix', label: 'Project ID Prefix', type: 'text', placeholder: 'PRJ-' },
          { key: 'auto_number', label: 'Auto-generate project numbers', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
  {
    key: 'workflow',
    label: 'Workflow',
    sections: [
      {
        key: 'statuses',
        title: 'Project Statuses',
        description: 'Configure available project statuses',
        fields: [
          { key: 'enable_custom_statuses', label: 'Enable custom statuses', type: 'switch', defaultValue: false },
          { key: 'require_approval', label: 'Require approval for status changes', type: 'switch', defaultValue: false },
        ],
      },
      {
        key: 'notifications',
        title: 'Notifications',
        fields: [
          { key: 'notify_on_create', label: 'Notify team on project creation', type: 'switch', defaultValue: true },
          { key: 'notify_on_complete', label: 'Notify stakeholders on completion', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
  {
    key: 'integrations',
    label: 'Integrations',
    sections: [
      {
        key: 'calendar',
        title: 'Calendar Integration',
        fields: [
          { key: 'sync_milestones', label: 'Sync milestones to calendar', type: 'switch', defaultValue: true },
          { key: 'sync_deadlines', label: 'Sync deadlines to calendar', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
];

export default function ProjectSettingsPage() {
  return (
    <SettingsTemplate
      title="Project Settings"
      description="Configure project module settings and defaults"
      tabs={projectSettingsTabs}
      onSave={async (values) => {
        console.log('Saving project settings:', values);
      }}
    />
  );
}
