'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { campaignSchema } from '@/lib/schemas/crm/campaign';

export default function ContentCampaignsPage() {
  return <CrudList schema={campaignSchema} />;
}
