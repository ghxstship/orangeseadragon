'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { talentSchema } from '@/lib/schemas/talent';

export default function TalentPage() {
  return <CrudList schema={talentSchema} />;
}
