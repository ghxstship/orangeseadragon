'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';
import { createClient } from '@/lib/supabase/client';

const profileTabs: SettingsTab[] = [
  {
    key: 'personal',
    label: 'Personal Information',
    sections: [
      {
        key: 'personal-info',
        title: 'Personal Information',
        description: 'Update your personal details and contact information',
        fields: [
          { key: 'firstName', label: 'First name', type: 'text' },
          { key: 'lastName', label: 'Last name', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'phone', label: 'Phone', type: 'text' },
          { key: 'jobTitle', label: 'Job title', type: 'text' },
          { key: 'department', label: 'Department', type: 'text' },
          { key: 'bio', label: 'Bio', type: 'textarea' },
        ],
      },
      {
        key: 'photo',
        title: 'Profile Photo',
        description: 'Upload a photo to personalize your account',
        fields: [
          { key: 'avatar', label: 'Avatar', type: 'text', placeholder: 'Upload or paste image URL' },
        ],
      },
    ],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    sections: [
      {
        key: 'notification-channels',
        title: 'Notification Channels',
        description: 'Choose how you receive notifications for each event type',
        fields: [
          { key: 'notify_email_tasks', label: 'Task assignments (Email)', type: 'switch' },
          { key: 'notify_push_tasks', label: 'Task assignments (Push)', type: 'switch' },
          { key: 'notify_inapp_tasks', label: 'Task assignments (In-app)', type: 'switch' },
          { key: 'notify_email_mentions', label: 'Mentions (Email)', type: 'switch' },
          { key: 'notify_push_mentions', label: 'Mentions (Push)', type: 'switch' },
          { key: 'notify_inapp_mentions', label: 'Mentions (In-app)', type: 'switch' },
          { key: 'notify_email_approvals', label: 'Approvals (Email)', type: 'switch' },
          { key: 'notify_push_approvals', label: 'Approvals (Push)', type: 'switch' },
          { key: 'notify_email_deadlines', label: 'Upcoming deadlines (Email)', type: 'switch' },
          { key: 'notify_push_deadlines', label: 'Upcoming deadlines (Push)', type: 'switch' },
          { key: 'notify_email_budget', label: 'Budget alerts (Email)', type: 'switch' },
          { key: 'notify_email_invoices', label: 'Invoice updates (Email)', type: 'switch' },
        ],
      },
      {
        key: 'digest',
        title: 'Digest Settings',
        description: 'Configure summary email frequency',
        fields: [
          { key: 'digest_frequency', label: 'Digest frequency', type: 'select', options: [{ label: 'Never', value: 'never' }, { label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }] },
        ],
      },
    ],
  },
  {
    key: 'connected',
    label: 'Connected Accounts',
    sections: [
      {
        key: 'calendar',
        title: 'Calendar Integration',
        description: 'Sync events and deadlines with your calendar',
        fields: [
          { key: 'google_calendar', label: 'Google Calendar', type: 'switch' },
          { key: 'outlook_calendar', label: 'Outlook Calendar', type: 'switch' },
          { key: 'apple_calendar', label: 'Apple Calendar', type: 'switch' },
        ],
      },
      {
        key: 'communication',
        title: 'Communication',
        description: 'Connect messaging and email platforms',
        fields: [
          { key: 'slack_connected', label: 'Slack', type: 'switch' },
          { key: 'teams_connected', label: 'Microsoft Teams', type: 'switch' },
          { key: 'email_forwarding', label: 'Email forwarding address', type: 'email' },
        ],
      },
    ],
  },
  {
    key: 'preferences',
    label: 'Preferences',
    sections: [
      {
        key: 'appearance',
        title: 'Appearance',
        description: 'Customize how the application looks',
        fields: [
          { key: 'theme', label: 'Theme', type: 'select', options: [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }] },
        ],
      },
      {
        key: 'locale',
        title: 'Regional Settings',
        description: 'Configure timezone, date, and number formats',
        fields: [
          { key: 'timezone', label: 'Timezone', type: 'select', options: [{ label: 'Eastern (ET)', value: 'America/New_York' }, { label: 'Central (CT)', value: 'America/Chicago' }, { label: 'Mountain (MT)', value: 'America/Denver' }, { label: 'Pacific (PT)', value: 'America/Los_Angeles' }, { label: 'UTC', value: 'UTC' }, { label: 'London (GMT)', value: 'Europe/London' }, { label: 'Berlin (CET)', value: 'Europe/Berlin' }, { label: 'Tokyo (JST)', value: 'Asia/Tokyo' }] },
          { key: 'date_format', label: 'Date format', type: 'select', options: [{ label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' }, { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' }, { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }] },
          { key: 'number_format', label: 'Number format', type: 'select', options: [{ label: '1,234.56', value: 'en-US' }, { label: '1.234,56', value: 'de-DE' }, { label: '1 234,56', value: 'fr-FR' }] },
          { key: 'currency', label: 'Default currency', type: 'select', options: [{ label: 'USD ($)', value: 'USD' }, { label: 'EUR (€)', value: 'EUR' }, { label: 'GBP (£)', value: 'GBP' }, { label: 'CAD (C$)', value: 'CAD' }, { label: 'AUD (A$)', value: 'AUD' }] },
        ],
      },
    ],
  },
];

export default function ProfileSettingsPage() {
  const searchParams = useSearchParams();

  const initialTabKey = useMemo(() => {
    const requestedTab = searchParams.get('tab');
    if (!requestedTab) return undefined;

    return profileTabs.some((tab) => tab.key === requestedTab)
      ? requestedTab
      : undefined;
  }, [searchParams]);

  const handleSave = async (data: Record<string, unknown>) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const firstName = typeof data.firstName === 'string' ? data.firstName.trim() : '';
    const lastName = typeof data.lastName === 'string' ? data.lastName.trim() : '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const avatarUrl = typeof data.avatar === 'string' ? data.avatar.trim() : '';
    const jobTitle = typeof data.jobTitle === 'string' ? data.jobTitle.trim() : '';
    const bio = typeof data.bio === 'string' ? data.bio.trim() : '';
    const phone = typeof data.phone === 'string' ? data.phone.trim() : '';

    await supabase.auth.updateUser({
      data: {
        full_name: fullName || undefined,
        job_title: jobTitle || undefined,
        bio: bio || undefined,
        phone: phone || undefined,
        theme: data.theme || undefined,
        timezone: data.timezone || undefined,
        date_format: data.date_format || undefined,
      },
    });

    await supabase
      .from('users')
      .update({
        full_name: fullName || undefined,
        first_name: firstName || null,
        last_name: lastName || null,
        job_title: jobTitle || null,
        bio: bio || null,
        phone: phone || null,
        avatar_url: avatarUrl || null,
      })
      .eq('id', user.id);
  };

  return (
    <SettingsTemplate
      title="Profile"
      description="Manage your personal information and preferences"
      tabs={profileTabs}
      {...(initialTabKey ? { initialTabKey } : {})}
      onSave={handleSave}
    />
  );
}
