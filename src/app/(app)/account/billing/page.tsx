'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const billingTabs: SettingsTab[] = [
  {
    key: 'plan',
    label: 'Current Plan',
    sections: [
      {
        key: 'subscription',
        title: 'Subscription',
        description: 'Manage your subscription plan',
        fields: [
          { key: 'planType', label: 'Plan Type', type: 'select', options: [
            { label: 'Free', value: 'free' },
            { label: 'Pro', value: 'pro' },
            { label: 'Enterprise', value: 'enterprise' },
          ]},
        ],
      },
    ],
  },
];

export default function BillingSettingsPage() {
  const handleSave = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <SettingsTemplate
      title="Billing"
      description="Manage your subscription and payment methods"
      tabs={billingTabs}
      onSave={handleSave}
    />
  );
}
