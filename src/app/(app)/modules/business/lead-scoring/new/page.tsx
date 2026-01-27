'use client';

import { CrudForm } from '@/lib/crud/components/CrudForm';
import { leadScoreSchema } from '@/lib/schemas/leadScore';

export default function NewLeadScorePage() {
  return <CrudForm schema={leadScoreSchema} mode="create" />;
}
