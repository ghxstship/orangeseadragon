'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { inspectionSchema } from '@/lib/schemas/inspection';

export default function InspectionDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={inspectionSchema} id={params.id} />;
}
