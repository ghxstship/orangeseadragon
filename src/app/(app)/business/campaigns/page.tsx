'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { campaignSchema } from '@/lib/schemas/campaign';

export default function CampaignsPage() {
  return <CrudList schema={campaignSchema} />;
}
