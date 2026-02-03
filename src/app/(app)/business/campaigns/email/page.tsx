'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { campaignSchema } from '@/lib/schemas/campaign';

export default function EmailCampaignsPage() {
  return <CrudList schema={campaignSchema} filter={{ campaign_type: 'email_blast' }} />;
}
