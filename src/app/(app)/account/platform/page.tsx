'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const platformSettingsTabs: SettingsTab[] = [
  {
    key: 'appearance',
    label: 'Appearance',
    sections: [
      {
        key: 'theme',
        title: 'Theme',
        description: 'Customize how the app looks',
        fields: [
          {
            key: 'theme', label: 'Color Theme', type: 'select', options: [
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
              { label: 'System', value: 'system' },
            ], defaultValue: 'system'
          },
          { key: 'compact_mode', label: 'Compact mode', type: 'switch', defaultValue: false },
          { key: 'animations', label: 'Enable animations', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
  {
    key: 'localization',
    label: 'Localization',
    sections: [
      {
        key: 'regional',
        title: 'Regional Settings',
        description: 'Language and regional preferences',
        fields: [
          {
            key: 'language', label: 'Language', type: 'select', options: [
              { label: 'English', value: 'en' },
              { label: 'Español', value: 'es' },
              { label: 'Français', value: 'fr' },
              { label: 'Deutsch', value: 'de' },
            ], defaultValue: 'en'
          },
          {
            key: 'timezone', label: 'Timezone', type: 'select', options: [
              { label: 'Eastern Time', value: 'America/New_York' },
              { label: 'Central Time', value: 'America/Chicago' },
              { label: 'Mountain Time', value: 'America/Denver' },
              { label: 'Pacific Time', value: 'America/Los_Angeles' },
              { label: 'London', value: 'Europe/London' },
            ], defaultValue: 'America/New_York'
          },
          {
            key: 'date_format', label: 'Date Format', type: 'select', options: [
              { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
              { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
              { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
            ], defaultValue: 'MM/DD/YYYY'
          },
          {
            key: 'time_format', label: 'Time Format', type: 'select', options: [
              { label: '12-hour (AM/PM)', value: '12h' },
              { label: '24-hour', value: '24h' },
            ], defaultValue: '12h'
          },
        ],
      },
    ],
  },
  {
    key: 'accessibility',
    label: 'Accessibility',
    sections: [
      {
        key: 'accessibility_options',
        title: 'Accessibility Options',
        description: 'Make the app easier to use',
        fields: [
          { key: 'sounds', label: 'Sound effects', type: 'switch', defaultValue: false },
          { key: 'keyboard_shortcuts', label: 'Keyboard shortcuts', type: 'switch', defaultValue: true },
          { key: 'reduce_motion', label: 'Reduce motion', type: 'switch', defaultValue: false },
          { key: 'high_contrast', label: 'High contrast', type: 'switch', defaultValue: false },
        ],
      },
    ],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    sections: [
      {
        key: 'notification_settings',
        title: 'Notification Preferences',
        description: 'Control how you receive notifications',
        fields: [
          { key: 'email_notifications', label: 'Email notifications', type: 'switch', defaultValue: true },
          { key: 'push_notifications', label: 'Push notifications', type: 'switch', defaultValue: true },
          { key: 'desktop_notifications', label: 'Desktop notifications', type: 'switch', defaultValue: false },
          { key: 'notification_sound', label: 'Notification sound', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
];

export default function PlatformSettingsPage() {
  return (
    <SettingsTemplate
      title="Platform Settings"
      description="Customize your app experience"
      tabs={platformSettingsTabs}
      onSave={async () => { /* TODO: implement save settings */ }}
    />
  );
}
