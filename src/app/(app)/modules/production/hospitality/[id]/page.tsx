'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { hospitalityRequestSchema } from '@/lib/schemas/hospitalityRequest';

export default function HospitalityDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={hospitalityRequestSchema} id={params.id} />;
}
