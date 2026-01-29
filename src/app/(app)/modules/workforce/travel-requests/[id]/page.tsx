'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { travelRequestSchema } from '@/lib/schemas/travelRequest';

export default function TravelRequestDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={travelRequestSchema} id={params.id} />;
}
