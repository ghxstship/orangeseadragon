'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { campaignSchema } from '@/lib/schemas/campaign';

export default function NewCampaignPage() {
  return <CrudForm schema={campaignSchema} mode="create" />;
}
