'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { leadScoreSchema } from '@/lib/schemas/leadScore';

export default function LeadScoringPage() {
  return <CrudList schema={leadScoreSchema} />;
}
