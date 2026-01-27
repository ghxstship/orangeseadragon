'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const organizationTabs: SettingsTab[] = [
  {
    key: 'details',
    label: 'Details',
    sections: [
      {
        key: 'org-details',
        title: 'Organization Details',
        description: 'Basic information about your organization',
        fields: [
          { key: 'name', label: 'Organization name', type: 'text' },
          { key: 'website', label: 'Website', type: 'text' },
          { key: 'industry', label: 'Industry', type: 'select', options: [
            { label: 'Live Events & Entertainment', value: 'live-events' },
            { label: 'Film & Television', value: 'film-tv' },
            { label: 'Music & Recording', value: 'music' },
            { label: 'Corporate Events', value: 'corporate' },
          ]},
          { key: 'size', label: 'Company size', type: 'select', options: [
            { label: '1-10 employees', value: '1-10' },
            { label: '11-50 employees', value: '11-50' },
            { label: '51-200 employees', value: '51-200' },
            { label: '201-500 employees', value: '201-500' },
            { label: '500+ employees', value: '500+' },
          ]},
          { key: 'description', label: 'Description', type: 'textarea' },
        ],
      },
    ],
  },
];

export default function OrganizationSettingsPage() {
  const handleSave = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <SettingsTemplate
      title="Organization"
      description="Manage your organization settings and team members"
      tabs={organizationTabs}
      onSave={handleSave}
    />
  );
}
