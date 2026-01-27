'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { leadScoreSchema } from '@/lib/schemas/leadScore';

export default function LeadScoreDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={leadScoreSchema} id={params.id} />;
}
