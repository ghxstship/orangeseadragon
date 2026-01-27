'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { partnerSchema } from '@/lib/schemas/partner';

export default function PartnerDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={partnerSchema} id={params.id} />;
}
