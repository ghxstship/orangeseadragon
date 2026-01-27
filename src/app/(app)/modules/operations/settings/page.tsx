'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const operationsSettingsTabs: SettingsTab[] = [
  {
    key: 'general',
    label: 'General',
    sections: [
      {
        key: 'venues',
        title: 'Venue Settings',
        fields: [
          { key: 'default_capacity', label: 'Default Capacity', type: 'number', defaultValue: 100 },
          { key: 'require_insurance', label: 'Require insurance documentation', type: 'switch', defaultValue: true },
        ],
      },
      {
        key: 'logistics',
        title: 'Logistics',
        fields: [
          { key: 'default_load_in_hours', label: 'Default load-in time (hours)', type: 'number', defaultValue: 4 },
          { key: 'default_load_out_hours', label: 'Default load-out time (hours)', type: 'number', defaultValue: 2 },
        ],
      },
    ],
  },
  {
    key: 'weather',
    label: 'Weather',
    sections: [
      {
        key: 'alerts',
        title: 'Weather Alerts',
        fields: [
          { key: 'enable_weather_alerts', label: 'Enable weather alerts', type: 'switch', defaultValue: true },
          { key: 'alert_threshold_temp', label: 'Temperature alert threshold (°F)', type: 'number', defaultValue: 95 },
          { key: 'alert_threshold_wind', label: 'Wind alert threshold (mph)', type: 'number', defaultValue: 25 },
        ],
      },
    ],
  },
];

export default function OperationsSettingsPage() {
  return (
    <SettingsTemplate
      title="Operations Settings"
      description="Configure operations module settings"
      tabs={operationsSettingsTabs}
      onSave={async (values) => console.log('Saving:', values)}
    />
  );
}
