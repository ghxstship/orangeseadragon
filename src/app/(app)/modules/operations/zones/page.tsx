'use client';

import { CrudList } from '@/lib/crud/components/CrudList';
import { zoneSchema } from '@/lib/schemas/zone';

export default function ZonesPage() {
  return <CrudList schema={zoneSchema} />;
}
