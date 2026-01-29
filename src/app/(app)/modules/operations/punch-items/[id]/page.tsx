'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { punchItemSchema } from '@/lib/schemas/punchItem';

export default function PunchItemDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={punchItemSchema} id={params.id} />;
}
