'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { documentSchema } from '@/lib/schemas/document';

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={documentSchema} id={params.id} />;
}
