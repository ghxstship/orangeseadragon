'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { talentSchema } from '@/lib/schemas/talent';

export default function TalentDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={talentSchema} id={params.id} />;
}
