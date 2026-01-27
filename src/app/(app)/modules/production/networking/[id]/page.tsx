'use client';

import { CrudDetail } from '@/lib/crud/components/CrudDetail';
import { networkingSessionSchema } from '@/lib/schemas/networkingSession';

export default function NetworkingSessionDetailPage({ params }: { params: { id: string } }) {
  return <CrudDetail schema={networkingSessionSchema} id={params.id} />;
}
