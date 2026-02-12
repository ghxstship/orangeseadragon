'use client';

import * as React from 'react';
import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const rateCardTabs: SettingsTab[] = [
  {
    key: 'default',
    label: 'Default Rates',
    sections: [
      {
        key: 'labor',
        title: 'Labor Rate Card',
        description: 'Default hourly rates by role for all projects',
        fields: [
          { key: 'pm_rate', label: 'Production Manager', type: 'text' },
          { key: 'td_rate', label: 'Technical Director', type: 'text' },
          { key: 'stagehand_rate', label: 'Stagehand', type: 'text' },
          { key: 'audio_rate', label: 'Audio Engineer', type: 'text' },
          { key: 'lighting_rate', label: 'Lighting Designer', type: 'text' },
          { key: 'video_rate', label: 'Video Engineer', type: 'text' },
          { key: 'rigger_rate', label: 'Rigger', type: 'text' },
          { key: 'carpenter_rate', label: 'Carpenter', type: 'text' },
        ],
      },
      {
        key: 'overtime',
        title: 'Overtime Multipliers',
        description: 'Multipliers applied after standard hours',
        fields: [
          { key: 'ot_threshold', label: 'OT threshold (hours/day)', type: 'text' },
          { key: 'ot_multiplier', label: 'OT multiplier (e.g. 1.5)', type: 'text' },
          { key: 'dt_threshold', label: 'Double-time threshold', type: 'text' },
          { key: 'dt_multiplier', label: 'Double-time multiplier', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'client',
    label: 'Client Rates',
    sections: [
      {
        key: 'client-overrides',
        title: 'Client-Specific Rate Cards',
        description: 'Override default rates for specific clients',
        fields: [
          { key: 'client', label: 'Client', type: 'select', options: [
            { label: 'Acme Corp', value: 'acme' },
            { label: 'Global Events Inc', value: 'global' },
            { label: 'Summit Productions', value: 'summit' },
          ]},
          { key: 'effective_date', label: 'Effective date', type: 'text' },
          { key: 'currency', label: 'Currency', type: 'select', options: [
            { label: 'USD', value: 'usd' },
            { label: 'EUR', value: 'eur' },
            { label: 'GBP', value: 'gbp' },
            { label: 'CAD', value: 'cad' },
          ]},
        ],
      },
    ],
  },
  {
    key: 'services',
    label: 'Service Rates',
    sections: [
      {
        key: 'service-catalog',
        title: 'Service Catalog',
        description: 'Flat-rate services for invoicing and proposals',
        fields: [
          { key: 'service_name', label: 'Service name', type: 'text' },
          { key: 'unit', label: 'Unit', type: 'select', options: [
            { label: 'Per Day', value: 'day' },
            { label: 'Per Hour', value: 'hour' },
            { label: 'Flat Fee', value: 'flat' },
            { label: 'Per Show', value: 'show' },
          ]},
          { key: 'rate', label: 'Rate', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
        ],
      },
    ],
  },
];

export default function RateCardsPage() {
  const handleSave = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <SettingsTemplate
      title="Rate Cards"
      description="Manage labor rates, overtime multipliers, and service pricing"
      tabs={rateCardTabs}
      onSave={handleSave}
    />
  );
}
