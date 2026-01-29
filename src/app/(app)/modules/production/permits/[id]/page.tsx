'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { permitSchema } from '@/lib/schemas/permit';

export default function PermitDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={permitSchema} id={params.id} />;
}
