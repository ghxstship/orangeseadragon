'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { exhibitorSchema } from '@/lib/schemas/exhibitor';

export default function ExhibitorDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={exhibitorSchema} id={params.id} />;
}
