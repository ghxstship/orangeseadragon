'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { groundTransportSchema } from '@/lib/schemas/operations/groundTransport';

export default function GroundTransportPage() {
  return <CrudList schema={groundTransportSchema} />;
}
