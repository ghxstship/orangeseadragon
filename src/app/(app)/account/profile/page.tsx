'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';

const profileTabs: SettingsTab[] = [
  {
    key: 'personal',
    label: 'Personal Information',
    sections: [
      {
        key: 'personal-info',
        title: 'Personal Information',
        description: 'Update your personal details',
        fields: [
          { key: 'firstName', label: 'First name', type: 'text' },
          { key: 'lastName', label: 'Last name', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'phone', label: 'Phone', type: 'text' },
          { key: 'jobTitle', label: 'Job title', type: 'text' },
          { key: 'bio', label: 'Bio', type: 'textarea' },
        ],
      },
    ],
  },
];

export default function ProfileSettingsPage() {
  const handleSave = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <SettingsTemplate
      title="Profile"
      description="Manage your personal information and preferences"
      tabs={profileTabs}
      onSave={handleSave}
    />
  );
}
