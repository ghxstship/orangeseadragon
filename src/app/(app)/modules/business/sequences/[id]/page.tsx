'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { emailSequenceSchema } from '@/lib/schemas/emailSequence';

export default function SequenceDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={emailSequenceSchema} id={params.id} />;
}
