'use client';

import { useEffect, useState } from 'react';
import { SettingsTemplate } from '@/components/templates/SettingsTemplate';
import type { SettingsTab } from '@/components/templates/SettingsTemplate';

const timerTabs: SettingsTab[] = [
  {
    key: 'general',
    label: 'General',
    sections: [
      {
        key: 'behavior',
        title: 'Timer Behavior',
        description: 'Configure how the desktop timer app operates',
        fields: [
          { key: 'auto_start', label: 'Auto-start timer on app launch', type: 'switch' },
          { key: 'idle_detection', label: 'Idle detection (minutes)', type: 'text' },
          { key: 'idle_action', label: 'When idle detected', type: 'select', options: [
            { label: 'Pause timer', value: 'pause' },
            { label: 'Discard idle time', value: 'discard' },
            { label: 'Keep running', value: 'keep' },
            { label: 'Ask me', value: 'ask' },
          ]},
          { key: 'pomodoro_enabled', label: 'Enable Pomodoro mode', type: 'switch' },
          { key: 'pomodoro_work', label: 'Work interval (minutes)', type: 'text' },
          { key: 'pomodoro_break', label: 'Break interval (minutes)', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'display',
    label: 'Display',
    sections: [
      {
        key: 'appearance',
        title: 'Appearance',
        description: 'Customize how the timer looks on your desktop',
        fields: [
          { key: 'show_in_menubar', label: 'Show timer in menu bar', type: 'switch' },
          { key: 'show_project_name', label: 'Show project name in menu bar', type: 'switch' },
          { key: 'compact_mode', label: 'Compact mode', type: 'switch' },
          { key: 'theme', label: 'Timer theme', type: 'select', options: [
            { label: 'System', value: 'system' },
            { label: 'Light', value: 'light' },
            { label: 'Dark', value: 'dark' },
          ]},
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
        title: 'Timer Alerts',
        description: 'Configure when the timer notifies you',
        fields: [
          { key: 'daily_goal_reminder', label: 'Daily goal reminder', type: 'switch' },
          { key: 'daily_goal_hours', label: 'Daily goal (hours)', type: 'text' },
          { key: 'long_running_alert', label: 'Alert after running for (hours)', type: 'text' },
          { key: 'end_of_day_reminder', label: 'End-of-day stop reminder', type: 'switch' },
          { key: 'end_of_day_time', label: 'End-of-day time', type: 'text' },
        ],
      },
    ],
  },
];

export default function DesktopTimerSettingsPage() {
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/desktop-timer')
      .then((res) => res.json())
      .then((json) => setInitialValues((json?.data as Record<string, unknown>) || {}))
      .catch(() => setInitialValues({}))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !initialValues) {
    return <div className="p-6 text-sm text-muted-foreground">Loading timer settings...</div>;
  }

  return (
    <SettingsTemplate
      title="Desktop Timer"
      description="Configure the ATLVS desktop time tracking companion app"
      tabs={timerTabs}
      initialValues={initialValues}
      onSave={async (values) => {
        const res = await fetch('/api/settings/desktop-timer', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error('Failed to save desktop timer settings');
      }}
    />
  );
}
