'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { campaignSchema } from '@/lib/schemas/campaign';

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={campaignSchema} id={params.id} />;
}
