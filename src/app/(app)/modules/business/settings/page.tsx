'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const businessSettingsTabs: SettingsTab[] = [
  {
    key: 'pipeline',
    label: 'Pipeline',
    sections: [
      {
        key: 'deals',
        title: 'Deal Settings',
        description: 'Configure deal management',
        fields: [
          { key: 'default_stage', label: 'Default Stage', type: 'select', options: [
            { label: 'Discovery', value: 'discovery' },
            { label: 'Proposal', value: 'proposal' },
            { label: 'Negotiation', value: 'negotiation' },
            { label: 'Closed Won', value: 'closed_won' },
          ], defaultValue: 'discovery' },
          { key: 'default_probability', label: 'Default Probability (%)', type: 'number', defaultValue: 30 },
          { key: 'enable_probability', label: 'Enable probability tracking', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
  {
    key: 'leads',
    label: 'Leads',
    sections: [
      {
        key: 'lead_management',
        title: 'Lead Management',
        description: 'Configure lead handling',
        fields: [
          { key: 'lead_scoring', label: 'Enable lead scoring', type: 'switch', defaultValue: true },
          { key: 'auto_assign', label: 'Auto-assign leads', type: 'switch', defaultValue: false },
          { key: 'require_source', label: 'Require lead source', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
  {
    key: 'proposals',
    label: 'Proposals',
    sections: [
      {
        key: 'proposal_settings',
        title: 'Proposal Settings',
        description: 'Configure proposal generation',
        fields: [
          { key: 'proposal_prefix', label: 'Proposal Prefix', type: 'text', defaultValue: 'PROP' },
          { key: 'validity_days', label: 'Default Validity (days)', type: 'number', defaultValue: 30 },
          { key: 'require_approval', label: 'Require approval', type: 'switch', defaultValue: false },
          { key: 'enable_esignature', label: 'Enable e-signature', type: 'switch', defaultValue: true },
        ],
      },
    ],
  },
  {
    key: 'contracts',
    label: 'Contracts',
    sections: [
      {
        key: 'contract_settings',
        title: 'Contract Settings',
        description: 'Configure contract management',
        fields: [
          { key: 'contract_prefix', label: 'Contract Prefix', type: 'text', defaultValue: 'CON' },
          { key: 'default_term_months', label: 'Default Term (months)', type: 'number', defaultValue: 12 },
          { key: 'auto_renewal', label: 'Auto-renewal', type: 'switch', defaultValue: false },
          { key: 'renewal_notice_days', label: 'Renewal Notice (days)', type: 'number', defaultValue: 30 },
        ],
      },
    ],
  },
];

export default function BusinessSettingsPage() {
  return (
    <SettingsTemplate
      title="Business Settings"
      description="Configure CRM and sales settings"
      tabs={businessSettingsTabs}
      onSave={async (values) => console.log('Saving:', values)}
    />
  );
}
