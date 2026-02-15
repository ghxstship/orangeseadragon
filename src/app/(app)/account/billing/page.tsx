'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';
import { throwApiErrorResponse } from '@/lib/api/error-message';

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
  const handleSave = async (data: Record<string, unknown>) => {
    const response = await fetch('/api/billing/subscription', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: data.planType }),
    });
    if (!response.ok) {
      await throwApiErrorResponse(response, 'Failed to update billing');
    }
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
