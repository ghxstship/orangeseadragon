'use client';

import { SettingsTemplate, SettingsTab } from '@/components/templates/SettingsTemplate';
import { createClient } from '@/lib/supabase/client';
import type { Json } from '@/types/database';

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
  const handleSave = async (data: Record<string, unknown>) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const orgId = user.user_metadata?.organization_id;
    if (!orgId) throw new Error('No organization found');

    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const website = typeof data.website === 'string' ? data.website.trim() : '';
    const description = typeof data.description === 'string' ? data.description.trim() : '';
    const industry = typeof data.industry === 'string' ? data.industry.trim() : '';
    const companySize = typeof data.size === 'string' ? data.size.trim() : '';

    const { data: orgData } = await supabase
      .from('organizations')
      .select('metadata')
      .eq('id', orgId)
      .single();

    const existingMetadata = orgData?.metadata;
    const nextMetadata: Record<string, Json | undefined> =
      existingMetadata && typeof existingMetadata === 'object' && !Array.isArray(existingMetadata)
        ? { ...(existingMetadata as Record<string, Json | undefined>) }
        : {};

    if (industry) {
      nextMetadata.industry = industry;
    } else {
      delete nextMetadata.industry;
    }

    if (companySize) {
      nextMetadata.company_size = companySize;
    } else {
      delete nextMetadata.company_size;
    }

    const updatePayload = {
      website: website || null,
      description: description || null,
      metadata: Object.keys(nextMetadata).length > 0 ? (nextMetadata as Json) : null,
      ...(name ? { name } : {}),
    };

    await supabase
      .from('organizations')
      .update(updatePayload)
      .eq('id', orgId);
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
