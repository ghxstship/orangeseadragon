'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { campaignSchema } from '@/lib/schemas/campaign';

export default function FormsPage() {
  return <CrudList schema={campaignSchema} filter={{ campaign_type: 'form' }} />;
}
