'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { showcaseSchema } from '@/lib/schemas/showcase';

export default function ShowcaseDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={showcaseSchema} id={params.id} />;
}
