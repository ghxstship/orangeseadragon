'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const networkSettingsTabs: SettingsTab[] = [
  {
    key: 'contacts',
    label: 'Contacts',
    sections: [
      {
        key: 'contact_management',
        title: 'Contact Management',
        description: 'Configure contact handling',
        fields: [
          { key: 'auto_sync', label: 'Auto-sync contacts', type: 'switch', defaultValue: true },
          { key: 'duplicate_check', label: 'Check for duplicates', type: 'switch', defaultValue: true },
          { key: 'require_email', label: 'Require email', type: 'switch', defaultValue: false },
          { key: 'require_phone', label: 'Require phone', type: 'switch', defaultValue: false },
        ],
      },
    ],
  },
  {
    key: 'vendors',
    label: 'Vendors',
    sections: [
      {
        key: 'vendor_management',
        title: 'Vendor Management',
        description: 'Configure vendor settings',
        fields: [
          { key: 'enable_ratings', label: 'Enable vendor ratings', type: 'switch', defaultValue: true },
          { key: 'require_approval', label: 'Require vendor approval', type: 'switch', defaultValue: false },
          { key: 'require_w9', label: 'Require W-9', type: 'switch', defaultValue: true },
          { key: 'require_insurance', label: 'Require insurance', type: 'switch', defaultValue: true },
          { key: 'review_period_days', label: 'Review Period (days)', type: 'number', defaultValue: 90 },
        ],
      },
    ],
  },
  {
    key: 'agencies',
    label: 'Agencies',
    sections: [
      {
        key: 'agency_settings',
        title: 'Agency Settings',
        description: 'Configure agency management',
        fields: [
          { key: 'default_commission', label: 'Default Commission (%)', type: 'number', defaultValue: 10 },
          { key: 'track_bookings', label: 'Track bookings', type: 'switch', defaultValue: true },
          { key: 'enable_portal', label: 'Enable agency portal', type: 'switch', defaultValue: false },
        ],
      },
    ],
  },
  {
    key: 'venues',
    label: 'Venues',
    sections: [
      {
        key: 'venue_settings',
        title: 'Venue Settings',
        description: 'Configure venue management',
        fields: [
          { key: 'track_capacity', label: 'Track capacity', type: 'switch', defaultValue: true },
          { key: 'require_floor_plan', label: 'Require floor plan', type: 'switch', defaultValue: false },
          { key: 'enable_search', label: 'Enable venue search', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
];

export default function NetworkSettingsPage() {
  return (
    <SettingsTemplate
      title="Network Settings"
      description="Configure network and contact settings"
      tabs={networkSettingsTabs}
      onSave={async (values) => console.log('Saving:', values)}
    />
  );
}
