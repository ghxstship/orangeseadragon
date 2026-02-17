'use client';

import { useEffect, useState } from 'react';
import { SettingsTemplate } from '@/components/templates/SettingsTemplate';
import type { SettingsTab } from '@/components/templates/SettingsTemplate';

const portalTabs: SettingsTab[] = [
  {
    key: 'access',
    label: 'Access',
    sections: [
      {
        key: 'viewer-role',
        title: 'Client Viewer Role',
        description: 'Allow clients to view project status, invoices, and reports without a paid seat',
        fields: [
          { key: 'portal_enabled', label: 'Enable client portal', type: 'switch' },
          { key: 'require_email_verification', label: 'Require email verification', type: 'switch' },
          { key: 'auto_expire_days', label: 'Auto-expire access after (days, 0 = never)', type: 'text' },
        ],
      },
      {
        key: 'permissions',
        title: 'Viewer Permissions',
        description: 'Control what client viewers can see',
        fields: [
          { key: 'view_project_status', label: 'View project status & timeline', type: 'switch' },
          { key: 'view_budgets', label: 'View budget summary', type: 'switch' },
          { key: 'view_invoices', label: 'View invoices & payments', type: 'switch' },
          { key: 'view_reports', label: 'View shared reports', type: 'switch' },
          { key: 'view_files', label: 'View shared files', type: 'switch' },
          { key: 'submit_approvals', label: 'Submit approvals', type: 'switch' },
          { key: 'add_comments', label: 'Add comments', type: 'switch' },
        ],
      },
    ],
  },
  {
    key: 'branding',
    label: 'Branding',
    sections: [
      {
        key: 'portal-branding',
        title: 'Portal Branding',
        description: 'Customize the client portal appearance',
        fields: [
          { key: 'portal_title', label: 'Portal title', type: 'text' },
          { key: 'welcome_message', label: 'Welcome message', type: 'textarea' },
          { key: 'primary_color', label: 'Primary color', type: 'text' },
          { key: 'logo_url', label: 'Logo URL', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    sections: [
      {
        key: 'client-notifications',
        title: 'Client Notifications',
        description: 'Configure what emails clients receive',
        fields: [
          { key: 'notify_invoice_created', label: 'New invoice notification', type: 'switch' },
          { key: 'notify_project_update', label: 'Project status change', type: 'switch' },
          { key: 'notify_file_shared', label: 'File shared notification', type: 'switch' },
          { key: 'notify_approval_request', label: 'Approval request', type: 'switch' },
          { key: 'digest_frequency', label: 'Digest frequency', type: 'select', options: [
            { label: 'Instant', value: 'instant' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Never', value: 'never' },
          ]},
        ],
      },
    ],
  },
];

export default function ClientPortalSettingsPage() {
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/client-portal')
      .then((res) => res.json())
      .then((json) => setInitialValues((json?.data as Record<string, unknown>) || {}))
      .catch(() => setInitialValues({}))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !initialValues) {
    return <div className="p-6 text-sm text-muted-foreground">Loading client portal settings...</div>;
  }

  return (
    <SettingsTemplate
      title="Client Portal"
      description="Configure the free client viewer role and portal experience"
      tabs={portalTabs}
      initialValues={initialValues}
      onSave={async (values) => {
        const res = await fetch('/api/settings/client-portal', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error('Failed to save client portal settings');
      }}
    />
  );
}
